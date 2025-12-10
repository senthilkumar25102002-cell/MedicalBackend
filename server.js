import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------
// ✅ MySQL Connection Pool (Correct for Render)
// ---------------------------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 🔄 Keep DB Alive (Render closes idle DB connections)
setInterval(async () => {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error("Keepalive Error:", err);
  }
}, 60000);

// ---------------------------------------------
// 📌 POST: Save Consultation Form
// ---------------------------------------------
app.post("/api/consult", async (req, res) => {
  const { name, contact, problem, date, message } = req.body;

  if (!name || !contact || !problem || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const sql =
      "INSERT INTO consultations (name, contact, problem, date, message) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [name, contact, problem, date, message]);

    res.status(200).json({ message: "Consultation submitted!" });
  } catch (err) {
    console.log("Insert Error:", err);
    res.status(500).json({ message: "Database Error" });
  }
});

// ---------------------------------------------
// 📌 POST: Feedback
// ---------------------------------------------
app.post("/api/feedback", async (req, res) => {
  const { name, location, rating, message } = req.body;

  try {
    const sql =
      "INSERT INTO feedbacks (name, location, rating, message) VALUES (?, ?, ?, ?)";
    await pool.query(sql, [name, location, rating, message]);

    res.json({ success: true, message: "Feedback submitted successfully!" });
  } catch (err) {
    console.log("Error inserting feedback:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ---------------------------------------------
// 📌 GET: All Feedback
// ---------------------------------------------
app.get("/api/feedback", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM feedbacks ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.log("Error fetching feedback:", err);
    res.status(500).json({ success: false });
  }
});

// ---------------------------------------------
// 📌 POST: Book Appointment
// ---------------------------------------------
app.post("/api/book-appointment", async (req, res) => {
  const { name, contact, problem, date, doctorName, doctorRole } = req.body;

  if (!name || !contact || !problem || !date || !doctorName || !doctorRole) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const sql = `
      INSERT INTO appointments 
      (name, contact, problem, date, doctorName, doctorRole)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      name,
      contact,
      problem,
      date,
      doctorName,
      doctorRole,
    ]);

    res.json({
      success: true,
      message: "Appointment booked successfully!",
    });
  } catch (err) {
    console.log("❌ Error inserting appointment:", err);
    res
      .status(500)
      .json({ success: false, message: "Database Error" });
  }
});

// ---------------------------------------------
// 📌 GET: All Appointments
// ---------------------------------------------
app.get("/api/appointments", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM appointments ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.log("❌ Error fetching appointments:", err);
    res.status(500).json({ success: false });
  }
});

// ---------------------------------------------
// 📌 Start Server
// ---------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
