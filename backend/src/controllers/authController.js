const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendToSheets } = require('../services/sheetsService');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const allowedRoles = ['candidate', 'company'];
  const userRole = allowedRoles.includes(role) ? role : 'candidate';

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, role: userRole });
  const token = signToken(user._id);

  sendToSheets({ name, email, role: userRole, createdAt: user.createdAt }).catch(() => {});

  res.status(201).json({ token, user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signToken(user._id);
  res.json({ token, user: user.toJSON() });
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
