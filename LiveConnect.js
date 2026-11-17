import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { parseCookie } from "cookie";

const ALLOWED_ORIGINS = [
  "http://127.0.0.1:3000",
   "http://localhost:3000"

];

function reject(socket, code, message) {
  socket.write(
    `HTTP/1.1 ${code} ${message}\r\n` +
      "Connection: close\r\n" +
      "Content-Length: 0\r\n\r\n"
  );
  socket.destroy();
}

function authenticate(req) {
  try {
    const cookies = parseCookie(req.headers.cookie || "");
    console.log("Cookie names:", Object.keys(cookies));
    if (!cookies.token) return null;

    return jwt.verify(cookies.token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (err) {
    console.log("JWT failed:", err.message);
    return null;
  }
}


export function InitiateWebsocket(server) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

  server.on("upgrade", (req, socket, head) => {
    // Must be attached first so a mid-handshake client drop can't crash the process
    socket.on("error", () => socket.destroy());
     console.log("UPGRADE:", req.url, "| host:", req.headers.host, "| origin:", req.headers.origin, "| has cookie:", Boolean(req.headers.cookie));

    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname !== "/ws") return reject(socket, 404, "Not Found");

      // Cookie auth => check Origin to prevent cross-site WebSocket hijacking
      const origin = req.headers.origin;
      console.log(origin);
      if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        return reject(socket, 403, "Forbidden");
      }

      const user = authenticate(req);
      console.log(user);
      if (!user) return reject(socket, 401, "Unauthorized");

      wss.handleUpgrade(req, socket, head, (ws) => {
        ws.user = user;
        wss.emit("connection", ws, req);
      });
    } catch {
      reject(socket, 400, "Bad Request");
    }
  });

  wss.on("connection", (ws) => {
    // Heartbeat
    ws.isAlive = true;
    ws.on("pong", () => (ws.isAlive = true));

    // Close when the token expires so the client re-auths
    const msLeft = ws.user.exp ? ws.user.exp * 1000 - Date.now() : null;
    const expiryTimer =  msLeft !== null ? setTimeout(() => ws.close(4401, "token expired"), Math.max(msLeft, 0)) : null;

    ws.on("message", (data) => {
     console.log(data);
    });

    ws.on("error", console.error);
    ws.on("close", () => clearTimeout(expiryTimer));
  });

  // One interval for all sockets
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
     
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
       ws.send("hello");
      ws.isAlive = false;
      ws.ping();
    }
  }, 30_000);

  wss.on("close", () => clearInterval(heartbeat));

  return wss;
}
