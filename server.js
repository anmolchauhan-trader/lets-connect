import "dotenv/config";                       // must be first
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import loginRoutes from "./login.js";
import { requireAuth } from "./auth.js";
import rateLimit from "express-rate-limit";
import liveConnector,{InitiateWebsocket} from "./LiveConnect.js";
import http from "http";



if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "Public");
const Routing=express.Router();
const server=http.createServer(app);
InitiateWebsocket(server);
server.listen(3000);


app.use("/api/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));   // needed for HTML forms
app.use(cookieParser());
app.use(express.static(publicDir));

app.use("/api", loginRoutes);
app.use("/ws", liveConnector);

app.get("/", (req, res) => {
  // already logged in? skip the login page
  try {
    jwt.verify(req.cookies.token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    return res.redirect("/dashboard");
  } catch {}
  res.sendFile(path.join(publicDir, "Login.html"));
});

app.get("/dashboard", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));   // stays OUTSIDE Public/
});

app.listen(PORT, () => console.log(`Server is running on port http://127.0.0.1:3000/`));
export default app;