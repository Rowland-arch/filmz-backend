const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { readData, writeData } = require('../store');
const { requireAuth, getSecret } = require('../middleware/auth');

const router = express.Router();

function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role || 'user', createdAt: user.createdAt };
}

function issueToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role || 'user' }, getSecret(), { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || password.length < 8) {
    return res.status(400).json({ message: 'Name, email and a password of at least 8 characters are required' });
  }

  const data = readData();
  if (data.users.some((user) => user.email.toLowerCase() === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const user = {
    id: crypto.randomUUID(), name, email,
    passwordHash: await bcrypt.hash(password, 12),
    role: process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };
  data.users.push(user);
  writeData(data);
  return res.status(201).json({ message: 'User registered successfully', token: issueToken(user), user: sanitizeUser(user) });
});

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const data = readData();
  const user = data.users.find((entry) => entry.email.toLowerCase() === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  return res.json({ message: 'Login successful', token: issueToken(user), user: sanitizeUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = readData().users.find((entry) => entry.id === req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: sanitizeUser(user) });
});

module.exports = router;
