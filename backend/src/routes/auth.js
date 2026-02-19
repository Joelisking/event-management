import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authLimiter } from '../middleware/rate-limit.js';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateRole,
  handleValidationErrors,
} from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/signup',
  authLimiter,
  validateName('firstName'),
  validateName('lastName'),
  validateEmail(),
  validatePassword(),
  validateRole(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        role,
        organizationName,
        userCategory,
        countryOfResidence,
        countryOfOrigin,
      } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res
          .status(400)
          .json({ error: 'All fields are required' });
      }

      // Validate user category
      const validCategories = [
        'pfw_student',
        'pfw_alumni',
        'community',
        'international',
      ];
      if (userCategory && !validCategories.includes(userCategory)) {
        return res
          .status(400)
          .json({ error: 'Invalid user category' });
      }

      // Validate location fields for international users
      if (userCategory === 'international') {
        if (!countryOfResidence) {
          return res.status(400).json({
            error:
              'Country of residence is required for international users',
          });
        }
      }

      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res
          .status(400)
          .json({ error: 'User already exists with this email' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await query(
        'INSERT INTO users (name, email, "passwordHash", role, organization_name, user_category, country_of_residence, country_of_origin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role, organization_name, user_category, country_of_residence, country_of_origin',
        [
          `${firstName} ${lastName}`,
          email,
          passwordHash,
          role || 'student',
          organizationName || null,
          userCategory || null,
          countryOfResidence || null,
          countryOfOrigin || null,
        ]
      );

      const user = result.rows[0];

      const secret = process.env.JWT_SECRET || 'my-secret-123';
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationName: user.organization_name,
          userCategory: user.user_category,
          countryOfResidence: user.country_of_residence,
          countryOfOrigin: user.country_of_origin,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

router.post(
  '/signin',
  authLimiter,
  validateEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      const result = await query(
        'SELECT id, name, email, "passwordHash", role, organization_name, user_category, country_of_residence, country_of_origin, total_points, events_attended FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res
          .status(401)
          .json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      const isValidPassword = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!isValidPassword) {
        return res
          .status(401)
          .json({ error: 'Invalid email or password' });
      }

      const secret = process.env.JWT_SECRET || 'my-secret-123';
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Signed in successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationName: user.organization_name,
          userCategory: user.user_category,
          countryOfResidence: user.country_of_residence,
          countryOfOrigin: user.country_of_origin,
        },
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Failed to sign in' });
    }
  }
);

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET || 'my-secret-123';
    const decoded = jwt.verify(token, secret);

    const result = await query(
      'SELECT id, name, email, role, organization_name, user_category, country_of_residence, country_of_origin, total_points, events_attended FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organization_name,
        userCategory: user.user_category,
        countryOfResidence: user.country_of_residence,
        countryOfOrigin: user.country_of_origin,
        total_points: user.total_points || 0,
        events_attended: user.events_attended || 0,
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
