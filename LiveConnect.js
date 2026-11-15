import express from "express"
import { WebSocketServer } from "ws"
import { pool} from "./db.js";
import jwt from "jsonwebtoken" 


const Routing=express.Router();
export function InitiateWebsocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (socket) => {
    let latest = null;

    socket.on('message', (data) => {
      latest = data.toString();       // just remember the newest one
    });

    const timer = setInterval(() => {
      if (latest === null) return;    // nothing new to send

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client!==socket) {
          client.send(latest);
        }
      });
      latest = null;
    }, 5000);

    socket.on('close', () => clearInterval(timer));
  });
}





async function  GetFriend(req,res){

    const payload = jwt.verify(req.cookies?.token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],});
      try{
      const Friends= await pool.query(
      "SELECT friends, password FROM newusers WHERE uid = $1",
      [payload.uid]
    );}
    catch{
    res.sendStatus(409).json({message:"unable to fetch for friends"});
    }
  return Friends;
}










export default Routing;

