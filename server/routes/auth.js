const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const wrap = require('../utils/wrap');
const { protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const payload = (u) => ({ token: sign(u), user: { id: u._id, name: u.name, email: u.email, role: u.role } });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
  if (!['manager', 'guest'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, role, password: await bcrypt.hash(password, 10) });
  res.status(201).json(payload(user));
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  if (role && user.role !== role)
    return res.status(403).json({ message: `This account is a ${user.role} account. Use the ${user.role} login.` });
  res.json(payload(user));
}));

router.get('/me', protect, wrap(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
}));

module.exports = router;
