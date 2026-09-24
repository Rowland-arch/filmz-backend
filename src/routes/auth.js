const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { readData, writeData, getAverageRating } = require('../store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

router.post('/register', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (name.length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const data = readData();
  data.users = Array.isArray(data.users) ? data.users : [];

  if (data.users.some((user) => user.email.toLowerCase() === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  writeData(data);

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET || 'filmz-secret',
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    message: 'User registered successfully',
    token,
    user: sanitizeUser(newUser)
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const data = readData();
  const user = data.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);

  if (!matches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'filmz-secret',
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user)
  });
});

router.get('/me', requireAuth, (req, res) => {
  const data = readData();
  const user = data.users.find((entry) => entry.id === req.user.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: sanitizeUser(user) });
});

module.exports = router;
