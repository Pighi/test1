
import express from 'express';
import multer from 'multer';
import cloudinary from '../services/cloudinary.js';
import pool from '../db.js';
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const uploadBufferToCloudinary = async (buffer, filename) => {
  const base64 = buffer.toString('base64');
  const dataUri = 'data:image/jpeg;base64,' + base64;
  const result = await cloudinary.uploader.upload(dataUri, { folder: 'pods_observations' });
  return result;
};

router.post('/', auth, upload.array('photos', 6), async (req, res) => {
  try {
    const { plant_name, species, location, notes, assignment_id, measurements } = req.body;
    const obs = await pool.query(
      `INSERT INTO observations (user_id, assignment_id, plant_name, species, location, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.userId, assignment_id || null, plant_name, species, location, notes]
    );
    const obsId = obs.rows[0].id;

    const mList = measurements ? JSON.parse(measurements) : [];
    for (const m of mList) {
      await pool.query(
        'INSERT INTO measurements (observation_id, metric_name, metric_value) VALUES ($1,$2,$3)',
        [obsId, m.metric_name, m.metric_value]
      );
    }

    const files = req.files || [];
    for (const f of files) {
      const r = await uploadBufferToCloudinary(f.buffer, f.originalname);
      await pool.query('INSERT INTO photos (observation_id, url, public_id) VALUES ($1,$2,$3)', [
        obsId, r.secure_url, r.public_id
      ]);
    }

    res.json({ observation: obs.rows[0], message: 'Observation saved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const obs = await pool.query('SELECT * FROM observations WHERE user_id=$1 ORDER BY observed_at DESC', [req.user.userId]);
    res.json({ observations: obs.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trends', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT date_trunc('day', m.recorded_at) as day, m.metric_name, avg(m.metric_value) as avg_val
       FROM measurements m JOIN observations o ON o.id=m.observation_id
       WHERE o.user_id=$1 GROUP BY day, m.metric_name ORDER BY day`,
      [req.user.userId]
    );
    res.json({ trends: r.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
