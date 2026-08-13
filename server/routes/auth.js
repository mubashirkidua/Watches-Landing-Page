import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { q, run } from '../db.js';
import { signToken, requireAuth, publicUser } from '../middleware.js';

const r = Router();

r.post('/register', (req, res) => {
  const { name, email, password, phone = '', address = '', city = '' } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });
  if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (q('SELECT id FROM users WHERE email = ?', email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  const info = run('INSERT INTO users (name, email, password_hash, role, phone, address, city, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    name.trim(), email.toLowerCase(), bcrypt.hashSync(password, 10), 'customer', phone, address, city, new Date().toISOString());
  const user = q('SELECT * FROM users WHERE id = ?', Number(info.lastInsertRowid));
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

r.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = q('SELECT * FROM users WHERE email = ?', email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

r.post('/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = q('SELECT * FROM users WHERE email = ?', email.toLowerCase());
  if (!user || user.role !== 'admin' || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  res.json({ token: signToken(user), admin: publicUser(user) });
});

r.get('/me', requireAuth, (req, res) => {
  const user = q('SELECT * FROM users WHERE id = ?', req.user.uid);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

export default r;
