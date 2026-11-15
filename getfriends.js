import express from "express";
import { pool } from "./db.js";

const router = express.Router();

router.post("/GetFriends", async (req, res) => {
  const { id } = req.body;
 
  if (!id) return res.status(400).json({ message: "invalid id" });

  try {
    const result = await pool.query(
      "SELECT friends FROM newusers WHERE uid = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "user not found" });
    }
    
    res.json({ friends: result.rows[0].friends || [] });
  } catch (e) {
    console.log("unable to query " + e.message);
    res.status(500).json({ message: "unable to query for friends" });
  }
});




router.post("/AddFriends", async (req, res) => {
  const { email, id } = req.body;
  console.log(email);
  if (!id || !email) {
    return res.status(400).json({ message: "invalid id or email" });
  }

  const client = await pool.connect();
  try {
    const found = await client.query(
      "SELECT uid FROM newusers WHERE email = $1",
      [email]
    );
    if (found.rows.length === 0) {
      return res.status(404).json({ message: "this friend does not exist" });
    }
    const friendId = found.rows[0].uid;

    await client.query("BEGIN");
    await client.query(
      "UPDATE newusers SET friends = array_append(friends, $1) WHERE uid = $2",
      [id, friendId]
    );
    await client.query(
      "UPDATE newusers SET friends = array_append(friends, $1) WHERE uid = $2",
      [friendId, id]
    );
    await client.query("COMMIT");

    res.json({ message: "successfully added new friend" });
  } catch (e) {
    await client.query("ROLLBACK");
    console.log("unable to add friend " + e.message);
    res.status(500).json({ message: "unable to add friend" });
  } finally {
    client.release();
  }
});

export default router;