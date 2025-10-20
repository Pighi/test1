import express from 'express';
import pool from '../db.js'; // your DB connection
import bcrypt from 'bcrypt';

const router = express.Router();

// TEMP: set secret in .env
// ADMIN_CREATION_SECRET=SomeStrongSecret123!

router.post('/create', async (req, res) => {
  try {
    // Validate secret
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_CREATION_SECRET) {
      return res.status(403).json({ error: 'Forbidden: invalid secret' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id,email,role',
      [name, email, hash, 'admin']
    );

    res.json({ created: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
