const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { readData, writeData } = require('../store');
const { requireAuth, getSecret } = require('../middleware/auth');
const router = express.Router();
const sanitizeUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role || 'user', createdAt: u.createdAt });
const issueToken = (u) => jwt.sign({ userId: u.id, email: u.email, role: u.role || 'user' }, getSecret(), { expiresIn: '7d' });

async function ensureAdminAccount() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const data = readData();
  let user = data.users.find((entry) => entry.email.toLowerCase() === email);
  if (!user) {
    user = { id: crypto.randomUUID(), name: 'Administrator', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin', createdAt: new Date().toISOString() };
    data.users.push(user);
  } else if (user.role !== 'admin') user.role = 'admin';
  writeData(data);
}

router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim(); const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || '');
  if (!name || !email || password.length < 8) return res.status(400).json({ message: 'Name, email and a password of at least 8 characters are required' });
  const data = readData(); if (data.users.some((u) => u.email.toLowerCase() === email)) return res.status(409).json({ message: 'User already exists' });
  const user = { id: crypto.randomUUID(), name, email, passwordHash: await bcrypt.hash(password, 12), role: email === String(process.env.ADMIN_EMAIL || '').toLowerCase() ? 'admin' : 'user', createdAt: new Date().toISOString() };
  data.users.push(user); writeData(data); res.status(201).json({ message: 'User registered successfully', token: issueToken(user), user: sanitizeUser(user) });
});
router.post('/login', async (req, res) => { const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || ''); const user = readData().users.find((u) => u.email.toLowerCase() === email); if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials' }); res.json({ message: 'Login successful', token: issueToken(user), user: sanitizeUser(user) }); });
router.get('/me', requireAuth, (req, res) => { const user = readData().users.find((u) => u.id === req.user.userId); if (!user) return res.status(404).json({ message: 'User not found' }); res.json({ user: sanitizeUser(user) }); });
module.exports = { router, ensureAdminAccount };
