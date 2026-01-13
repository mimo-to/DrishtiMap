// TEMPORARY FILE: REMOVE IN PRODUCTION
// This file is for development testing of authentication middleware only.

const express = require('express');
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Mock Login to get a token
router.post('/login-mock', (req, res) => {
  // Hardcoded mock user for testing
  const user = {
    id: 'mock_user_123',
    role: req.body.role || 'user' // Default to user, allow testing admin
  };

  // Sign token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.status(200).json({
    success: true,
    token,
    user
  });
});

// Protected Route Example
router.get('/protected', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to protected route',
    user: req.user
  });
});

// Admin Route Example
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to admin route',
    user: req.user
  });
});

module.exports = router;
