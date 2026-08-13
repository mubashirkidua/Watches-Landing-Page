import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import couponRoutes from './routes/coupons.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';

const ROOT = path.join(import.meta.dirname, '..');
const PORT = Number(process.env.PORT || 4173);

export const app = express();

app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/* API */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'ocean-watches', time: new Date().toISOString() });
});

/* Admin panel */
const adminIndex = path.join(ROOT, 'admin', 'index.html');
if (fs.existsSync(adminIndex)) {
  app.get(['/admin', '/admin/'], (req, res) => res.sendFile(adminIndex));
}

/* Static site */
app.use(express.static(ROOT, {
  extensions: ['html'],
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

/* SPA-ish fallback to index for unknown HTML paths (only if file exists) */
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const target = path.join(ROOT, req.path.slice(1));
  if (!req.path.endsWith('/') && fs.existsSync(target)) return res.sendFile(target);
  return next();
});

/* JSON 404 for API, HTML 404 otherwise */
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.status(404).type('html').send('<h1>404 — Not found</h1><p><a href="/">Back to home</a></p>');
});

app.use((err, req, res, next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'Server error', detail: err.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`The Ocean Watches server → http://localhost:${PORT}`);
    console.log(`Admin panel         → http://localhost:${PORT}/admin`);
    console.log(`API health          → http://localhost:${PORT}/api/health`);
  });
}
