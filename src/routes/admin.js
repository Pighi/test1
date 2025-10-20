
import express from 'express';
import pool from '../db.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/assign', adminAuth, async (req, res) => {
  try {
    const { title, description, assigned_to, due_date } = req.body;
    const r = await pool.query(
      'INSERT INTO assignments (title,description,assigned_by,assigned_to,due_date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [title, description, req.user.userId, assigned_to, due_date]
    );
    res.json({ assignment: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/students', adminAuth, async (req, res) => {
  try {
    const r = await pool.query('SELECT id,name,email,created_at FROM users WHERE role=$1', ['student']);
    res.json({ students: r.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
