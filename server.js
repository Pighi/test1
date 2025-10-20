import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

// Replace with your frontend URL (Vercel) and localhost for local dev
const allowedOrigins = [
  "https://test12-psi-two.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true // Important: allows cookies to be sent cross-domain
}));

// Example JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Simple login/signup routes (replace with your actual logic)
import jwt from "jsonwebtoken";

const users = []; // temporary storage, replace with DB

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email exists" });
  const user = { id: users.length+1, name, email, password, role: "student" };
  users.push(user);
  res.json({ message: "User created" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Generate JWT token
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

  // Send token in response
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.listen(process.env.PORT || 5000, () => console.log("Server running"));
