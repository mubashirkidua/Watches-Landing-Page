import { Router } from 'express';
import { q, qa, run } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware.js';

const r = Router();

function toProduct(p) {
  return {
    id: p.id, category: p.category, name: p.name, img: p.img, desc: p.desc,
    original: p.original, discount: p.discount, rating: p.rating, reviews: p.reviews,
    badge: { label: p.badge_label, type: p.badge_type },
    featured: !!p.featured, off: p.off, stock: p.stock,
    specs: JSON.parse(p.specs || '[]'),
    available: p.stock > 0
  };
}

/* Public catalogue */
r.get('/', (req, res) => {
  const { category, featured } = req.query;
  let sql = 'SELECT * FROM products';
  const args = [];
  if (category && category !== 'all') { sql += ' WHERE category = ?'; args.push(category); }
  else if (featured === 'true') { sql += ' WHERE featured = 1'; }
  const rows = qa(sql + ' ORDER BY name ASC', ...args);
  res.json({ products: rows.map(toProduct) });
});

r.get('/categories', (req, res) => {
  const rows = qa('SELECT category, COUNT(*) AS count FROM products GROUP BY category ORDER BY category ASC');
  res.json({ categories: rows.map(x => ({ name: x.category, count: x.count })) });
});

r.get('/:id', (req, res) => {
  const p = q('SELECT * FROM products WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: toProduct(p) });
});

/* Admin: create / update / delete products */
r.post('/products', requireAuth, requireAdmin, (req, res) => {
  const b = req.body || {};
  const required = ['id', 'name', 'img', 'desc', 'category', 'original', 'discount'];
  for (const k of required) if (b[k] === undefined || b[k] === null || b[k] === '') {
    return res.status(400).json({ error: 'Missing required field: ' + k });
  }
  const original = Math.round(Number(b.original));
  const discount = Math.round(Number(b.discount));
  if (original <= 0 || discount <= 0 || discount > original) {
    return res.status(400).json({ error: 'Prices must be positive and discount <= original' });
  }
  if (q('SELECT id FROM products WHERE id = ?', b.id)) {
    return res.status(409).json({ error: 'Product id already exists: ' + b.id });
  }
  const off = Math.round((1 - discount / original) * 100);
  run(`INSERT INTO products (id, category, name, img, desc, original, discount, rating, reviews, badge_label, badge_type, featured, off, stock, specs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    b.id, b.category, b.name, b.img, b.desc, original, discount,
    Number(b.rating || 4.5), Number(b.reviews || 0),
    (b.badge && b.badge.label) || '', (b.badge && b.badge.type) || 'gold',
    b.featured ? 1 : 0, off, Number(b.stock || 0), JSON.stringify(b.specs || []));
  res.status(201).json({ product: toProduct(q('SELECT * FROM products WHERE id = ?', b.id)) });
});

r.put('/products/:id', requireAuth, requireAdmin, (req, res) => {
  const p = q('SELECT * FROM products WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  const b = req.body || {};
  const original = Math.round(Number(b.original ?? p.original));
  const discount = Math.round(Number(b.discount ?? p.discount));
  if (discount <= 0 || discount > original) return res.status(400).json({ error: 'Invalid prices' });
  const off = Math.round((1 - discount / original) * 100);
  run(`UPDATE products SET category = ?, name = ?, img = ?, desc = ?, original = ?, discount = ?, rating = ?, reviews = ?,
       badge_label = ?, badge_type = ?, featured = ?, off = ?, stock = ?, specs = ? WHERE id = ?`,
    b.category ?? p.category, b.name ?? p.name, b.img ?? p.img, b.desc ?? p.desc, original, discount,
    Number(b.rating ?? p.rating), Number(b.reviews ?? p.reviews),
    (b.badge && b.badge.label) ?? p.badge_label, (b.badge && b.badge.type) ?? p.badge_type,
    b.featured !== undefined ? (b.featured ? 1 : 0) : p.featured, off,
    b.stock !== undefined ? Number(b.stock) : p.stock,
    JSON.stringify(b.specs ?? JSON.parse(p.specs)), req.params.id);
  res.json({ product: toProduct(q('SELECT * FROM products WHERE id = ?', req.params.id)) });
});

r.delete('/products/:id', requireAuth, requireAdmin, (req, res) => {
  const info = run('DELETE FROM products WHERE id = ?', req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
});

export default r;
