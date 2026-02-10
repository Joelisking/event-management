import express from 'express';
import { query, getClient } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = express.Router();

// Get all rewards
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM rewards ORDER BY cost ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// Create reward (Admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    // Assuming checkAdmin middleware or checking role here
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, cost, imageUrl } = req.body;

    if (!name || !cost) {
      return res
        .status(400)
        .json({ error: 'Name and cost are required' });
    }

    const result = await query(
      `INSERT INTO rewards (name, description, cost, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, cost, imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// Redeem reward (with transaction and row locking to prevent race conditions)
router.post('/:id/redeem', authenticate, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const userId = req.user.userId;

    // Lock reward row (prevents concurrent redemptions of same reward)
    const rewardResult = await client.query(
      'SELECT * FROM rewards WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (rewardResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reward not found' });
    }
    const reward = rewardResult.rows[0];

    // Lock user row (prevents concurrent point modifications)
    const userResult = await client.query(
      'SELECT total_points FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    const user = userResult.rows[0];

    // Idempotency check: Has user already redeemed this reward recently?
    const recentRedemption = await client.query(
      `SELECT * FROM redemptions
       WHERE user_id = $1 AND reward_id = $2
       AND redeemed_at > NOW() - INTERVAL '5 seconds'`,
      [userId, id]
    );

    if (recentRedemption.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Duplicate redemption detected' });
    }

    if (user.total_points < reward.cost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Atomic point deduction
    const updateResult = await client.query(
      `UPDATE users
       SET total_points = total_points - $1
       WHERE id = $2
       RETURNING total_points`,
      [reward.cost, userId]
    );

    // Record redemption
    await client.query(
      `INSERT INTO redemptions (user_id, reward_id, points_spent)
       VALUES ($1, $2, $3)`,
      [userId, id, reward.cost]
    );

    // Create notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'points', 'Reward Redeemed', $2)`,
      [userId, `You redeemed ${reward.name} for ${reward.cost} points.`]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Reward redeemed successfully',
      remainingPoints: updateResult.rows[0].total_points,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  } finally {
    client.release();
  }
});

export default router;
