
import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function createuser() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS public.newusers (
      uid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      friends INTEGER[] DEFAULT '{}'
    );
  `;

  await pool.query(queryText);
  console.log("Users table is ready")
}


async function checkDatabase() {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS username,
        inet_server_addr() AS server_ip,
        inet_server_port() AS server_port
    `);

    console.log("CONNECTED DATABASE:", result.rows[0]);

  } catch (err) {
    console.error("DATABASE CHECK FAILED:", err.message);
  }
}

checkDatabase();



pool.on("error", (err) => {
  console.error("Unexpected database connection error:", err);
});

async function initDB() {
  try {
    await pool.query("SELECT 1");
    console.log("Database is connected");

    await createuser();
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exitCode = 1;
  }
}

await initDB();

export { pool, createuser };
