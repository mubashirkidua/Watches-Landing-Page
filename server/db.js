import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(import.meta.dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'ocean.sqlite');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  img TEXT NOT NULL,
  desc TEXT NOT NULL,
  original INTEGER NOT NULL,
  discount INTEGER NOT NULL,
  rating REAL NOT NULL,
  reviews INTEGER NOT NULL,
  badge_label TEXT,
  badge_type TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  off INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  specs TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value INTEGER NOT NULL,
  min_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  max_uses INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  coupon_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_method TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  gateway TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  txn_id TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`);

function loadCatalogue() {
  const file = path.join(import.meta.dirname, '..', 'assets', 'js', 'products.js');
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox, { filename: file });
  const list = sandbox.window.OW_PRODUCTS || [];
  return list.map((p, i) => ({
    id: p.id,
    category: p.category,
    name: p.name,
    img: p.img,
    desc: p.desc,
    original: Math.round(p.original),
    discount: Math.round(p.discount),
    rating: p.rating,
    reviews: p.reviews,
    badge_label: p.badge ? p.badge.label : '',
    badge_type: p.badge ? p.badge.type : '',
    featured: p.featured ? 1 : 0,
    off: Math.round((1 - p.discount / p.original) * 100),
    stock: 10 + ((i * 7) % 13),
    specs: JSON.stringify(p.specs || [])
  }));
}

function seed() {
  const row = db.prepare('SELECT COUNT(*) AS c FROM products').get();
  if (row.c === 0) {
    const ins = db.prepare(`INSERT INTO products (id, category, name, img, desc, original, discount, rating, reviews, badge_label, badge_type, featured, off, stock, specs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const tx = db.prepare('BEGIN');
    tx.run();
    for (const p of loadCatalogue()) {
      ins.run(p.id, p.category, p.name, p.img, p.desc, p.original, p.discount, p.rating, p.reviews,
        p.badge_label, p.badge_type, p.featured, p.off, p.stock, p.specs);
    }
    db.prepare('COMMIT').run();
  }

  const cRow = db.prepare('SELECT COUNT(*) AS c FROM coupons').get();
  if (cRow.c === 0) {
    const ins = db.prepare('INSERT INTO coupons (id, name, type, value, min_order, active, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, 1, ?, NULL)');
    ins.run('OCEAN10', '10% off all watches', 'percent', 10, 50000, 0);
    ins.run('OCEAN50', 'Rs. 50,000 off premium orders', 'flat', 50000, 200000, 0);
  }

  const uRow = db.prepare('SELECT COUNT(*) AS c FROM users WHERE role = ?').get('admin');
  if (uRow.c === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@oceanwatches.com';
    const pass = process.env.ADMIN_PASSWORD || 'admin123';
    db.prepare('INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
      .run('Store Admin', email, bcrypt.hashSync(pass, 10), 'admin', new Date().toISOString());
  }
}

seed();

export { db };
export const q = (sql, ...args) => db.prepare(sql).get(...args);
export const qa = (sql, ...args) => db.prepare(sql).all(...args);
export const run = (sql, ...args) => db.prepare(sql).run(...args);
export default db;
