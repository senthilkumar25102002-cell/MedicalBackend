import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 📌 MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Connection Error:", err);
  } else {
    console.log("MySQL Connected Successfully");
  }
});

// 📌 POST: Save Consultation Form
app.post("/api/consult", (req, res) => {
  const { name, contact, problem, date, message } = req.body;

  if (!name || !contact || !problem || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query =
    "INSERT INTO consultations (name, contact, problem, date, message) VALUES (?, ?, ?, ?, ?)";

  db.query(query, [name, contact, problem, date, message], (err, result) => {
    if (err) {
      console.log("Insert Error:", err);
      return res.status(500).json({ message: "Database Error" });
    }

    res.status(200).json({ message: "Consultation submitted!" });
  });
});

// 📌 POST: Feedback
app.post("/api/feedback", (req, res) => {
  const { name, location, rating, message } = req.body;

  const sql = `INSERT INTO feedbacks (name, location, rating, message) VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, location, rating, message], (err, result) => {
    if (err) {
      console.log("Error inserting feedback:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, message: "Feedback submitted successfully!" });
  });
});

// 📌 GET: All Feedback
app.get("/api/feedback", (req, res) => {
  db.query("SELECT * FROM feedbacks ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.log("Error fetching feedback:", err);
      return res.status(500).json({ success: false });
    }

    res.json(rows);
  });
});



app.post("/api/book-appointment", (req, res) => {
  const { name, contact, problem, date, doctorName, doctorRole } = req.body;

  if (!name || !contact || !problem || !date || !doctorName || !doctorRole) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const sql = `
    INSERT INTO appointments 
    (name, contact, problem, date, doctorName, doctorRole)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, contact, problem, date, doctorName, doctorRole],
    (err, result) => {
      if (err) {
        console.log("❌ Error inserting appointment:", err);
        return res.status(500).json({ success: false, message: "Database Error" });
      }

      res.status(200).json({
        success: true,
        message: "Appointment booked successfully!",
      });
    }
  );
});

// --------------------------------------------------------
// 📌 (Optional) Get All Appointments
// --------------------------------------------------------
app.get("/api/appointments", (req, res) => {
  db.query("SELECT * FROM appointments ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.log("❌ Error fetching appointments:", err);
      return res.status(500).json({ success: false });
    }
    res.json(rows);
  });
});

// 📌 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
