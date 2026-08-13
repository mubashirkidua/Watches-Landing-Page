import { Router } from 'express';
import { q, qa, run } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware.js';

const r = Router();

function toCoupon(c) {
  return {
    id: c.id, name: c.name, type: c.type, value: c.value, min_order: c.min_order,
    active: !!c.active, max_uses: c.max_uses, used: c.used, expires_at: c.expires_at
  };
}

/* Public: validate a code against a subtotal */
r.post('/validate', (req, res) => {
  const { code, subtotal = 0 } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Coupon code required' });
  const c = q('SELECT * FROM coupons WHERE id = ?', code.trim().toUpperCase());
  if (!c || !c.active) return res.status(404).json({ error: 'Invalid coupon code', code });
  if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) {
    return res.status(410).json({ error: 'This coupon has expired', code });
  }
  if (c.max_uses > 0 && c.used >= c.max_uses) {
    return res.status(410).json({ error: 'This coupon has reached its usage limit', code });
  }
  if (subtotal < c.min_order) {
    return res.status(422).json({ error: 'Minimum order of ' + Number(c.min_order).toLocaleString('en-IN') + ' required', code, min_order: c.min_order });
  }
  const discount = c.type === 'percent' ? Math.round(subtotal * c.value / 100) : c.value;
  res.json({
    code: c.id, name: c.name, type: c.type, value: c.value,
    discount: Math.min(discount, subtotal)
  });
});

/* Admin CRUD */
r.get('/', requireAuth, requireAdmin, (req, res) => {
  res.json({ coupons: qa('SELECT * FROM coupons ORDER BY id ASC').map(toCoupon) });
});

r.post('/', requireAuth, requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.id || !b.type || !b.value) return res.status(400).json({ error: 'code, type and value are required' });
  if (b.type !== 'percent' && b.type !== 'flat') return res.status(400).json({ error: 'type must be percent or flat' });
  const id = String(b.id).trim().toUpperCase();
  if (q('SELECT id FROM coupons WHERE id = ?', id)) return res.status(409).json({ error: 'Coupon already exists' });
  run('INSERT INTO coupons (id, name, type, value, min_order, active, max_uses, used, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)',
    id, b.name || id, b.type, Math.round(Number(b.value)), Math.round(Number(b.min_order || 0)),
    b.active === false ? 0 : 1, Math.round(Number(b.max_uses || 0)), b.expires_at || null);
  res.status(201).json({ coupon: toCoupon(q('SELECT * FROM coupons WHERE id = ?', id)) });
});

r.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const c = q('SELECT * FROM coupons WHERE id = ?', req.params.id);
  if (!c) return res.status(404).json({ error: 'Coupon not found' });
  const b = req.body || {};
  run('UPDATE coupons SET name = ?, type = ?, value = ?, min_order = ?, active = ?, max_uses = ?, expires_at = ? WHERE id = ?',
    b.name ?? c.name, b.type ?? c.type, Math.round(Number(b.value ?? c.value)),
    Math.round(Number(b.min_order ?? c.min_order)),
    b.active === undefined ? c.active : (b.active ? 1 : 0),
    Math.round(Number(b.max_uses ?? c.max_uses)),
    b.expires_at === undefined ? c.expires_at : (b.expires_at || null), req.params.id);
  res.json({ coupon: toCoupon(q('SELECT * FROM coupons WHERE id = ?', req.params.id)) });
});

r.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const info = run('DELETE FROM coupons WHERE id = ?', req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Coupon not found' });
  res.json({ ok: true });
});

export default r;
