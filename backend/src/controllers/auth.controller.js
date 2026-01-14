const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Assuming User model exists, if not we might need to mock or create

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // For Development/Verification: Allow simple admin login without DB if User not found?
    // STRICT RULE: Use DB.
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
       // Development Verification Backdoor (Safeguard: ONLY if no users exist?)
       // No, strictly follow standard flow. If no user, we must register one or use seed.
       // The instruction says "If Register exists, create... If no register, try loggin in with admin@example.com".
       // If DB is empty, login fails.
       return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);

  } catch (err) {
    next(err);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        sendTokenResponse(user, 200, res);
    } catch(err) {
        next(err);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
