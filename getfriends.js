import express from "express"
import {pool} from 'pg'

const router=express.Router();

router.post("/GetFriends/id:",async(req,res)=>{
    const id=req.params.id;
    if(!id) res.sendStatus(400).json({message:"invalid id"});
    try{
         const friends= await pool.query("SELECT friends FROM newusers WHERE uid = $1",[id]);
         if(!friends)  res.sendStatus(400).json({message:"friends not exists"});
         res.send(friends);
    } catch(e){
        console.log("unable to query"+e.message);
        res.sendStatus(400).json({message:"unable to query for friends"});
    }

});

router.post("/AddFriends",async(req,res)=>{
    const {email,id}=req.body;
    if(!id || !email) res.sendStatus(400).json({message:"invalid id"});

    try{
        const FriendId= await pool.query("SELECT uid FROM newusers WHERE email=$1",[email]);
        
        if(!FriendId) res.sendStatus(400).json({message:"this friend does not exists"});
        
         await pool.query("UPDATE newusers friends=array_appends(friends,$1) WHERE uid=$2  ",[id,FriendId]);
        
         const complete=await pool.query("UPDATE newusers friends=array_appends(friends,$1) WHERE uid=$2  ",[FriendId,id]);
        
        if(!complete) res.sendStatus(400).json({message:"this friend does not exists"});
        
        res.sendStatus(200).json({message:"succesfully added new friend"});

    }catch(e){
          console.log("unable to query"+e.message);
        res.sendStatus(400).json({message:"unable to query to add friends"});
    }

});


export default router;