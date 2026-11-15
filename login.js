import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool} from "./db.js";

const router = express.Router();
const isProd = process.env.NODE_ENV === "production";

function setAuthCookie(res, uid) {
  const token = jwt.sign({ uid }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

    res.cookie("uid", String(uid), {
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post("/login", async (req, res) => {
 
 
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT uid, password FROM newusers WHERE email = $1",
      [email]
    );

    // no such user -> create one
    if (rows.length === 0) {
      const hash = await bcrypt.hash(password, 10);
      const created = await pool.query(
        "INSERT INTO newusers (email, password) VALUES ($1, $2) RETURNING uid",
        [email, hash]
      );
     
      setAuthCookie(res, created.rows[0].uid);
      return res.redirect(303, "/dashboard");
    }

    // user exists -> check password
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    setAuthCookie(res, user.uid);
    return res.redirect(303, "/dashboard");
  } catch (error) {
    // two simultaneous signups with the same email
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect(303, "/");
});

export default router;