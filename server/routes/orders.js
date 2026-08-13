import { Router } from 'express';
import { q, qa, run, db } from '../db.js';
import { requireAuth, JWT_SECRET } from '../middleware.js';
import { sendMail } from '../lib/mail.js';
import { initGateway } from '../lib/payments.js';
import jwt from 'jsonwebtoken';

const r = Router();

const fmt = n => 'Rs. ' + Number(n).toLocaleString('en-IN');

function nextOrderId() {
  const year = new Date().getFullYear();
  const row = q('SELECT COUNT(*) AS c FROM orders WHERE substr(id, 4, 4) = ?', String(year));
  return 'OW-' + year + '-' + String(row.c + 1).padStart(6, '0');
}

function computeCoupon(code, subtotal) {
  if (!code) return { discount: 0 };
  const c = q('SELECT * FROM coupons WHERE id = ?', code.trim().toUpperCase());
  if (!c || !c.active) return { discount: 0, invalid: true };
  if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) return { discount: 0, invalid: true };
  if (c.max_uses > 0 && c.used >= c.max_uses) return { discount: 0, invalid: true };
  if (subtotal < c.min_order) return { discount: 0, belowMin: true, min: c.min_order };
  const d = c.type === 'percent' ? Math.round(subtotal * c.value / 100) : c.value;
  return { discount: Math.min(d, subtotal), coupon: c.id };
}

r.post('/', async (req, res) => {
  const { items, customer, coupon, payment_method = 'card' } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Cart is empty' });
  if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address || !customer.city) {
    return res.status(400).json({ error: 'Delivery details are incomplete' });
  }
  if (!/^\S+@\S+\.\S+$/.test(customer.email)) return res.status(400).json({ error: 'Invalid email' });

  const lines = [];
  for (const it of items) {
    const p = q('SELECT * FROM products WHERE id = ?', it.id);
    if (!p) return res.status(404).json({ error: 'Product not found: ' + it.id });
    const qty = Math.max(1, Math.min(20, Number(it.qty) || 1));
    if (p.stock < qty) {
      return res.status(409).json({ error: p.name + ' has only ' + p.stock + ' left in stock' });
    }
    lines.push({ p, qty });
  }

  const subtotal = lines.reduce((s, l) => s + l.p.discount * l.qty, 0);
  const cp = computeCoupon(coupon, subtotal);
  const discount = cp.discount || 0;
  const total = subtotal - discount;
  const orderId = nextOrderId();

  /* link order to a signed-in customer when a valid token is supplied */
  let customerId = null;
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    try { customerId = jwt.verify(auth.slice(7), JWT_SECRET).uid; } catch (err) { /* guest checkout */ }
  }

  run('BEGIN');
  try {
    run(`INSERT INTO orders (id, customer_id, name, email, phone, address, city, subtotal, discount, shipping, total, coupon_code, status, payment_status, payment_method, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      orderId, customerId,
      customer.name.trim(), customer.email.trim(), customer.phone.trim(),
      customer.address.trim(), customer.city.trim(),
      subtotal, discount, 0, total, cp.coupon || null,
      'pending', payment_method === 'cod' ? 'cod' : 'unpaid', payment_method,
      new Date().toISOString());

    const insItem = db.prepare('INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)');
    for (const l of lines) {
      insItem.run(orderId, l.p.id, l.p.name, l.p.discount, l.qty);
      run('UPDATE products SET stock = stock - ? WHERE id = ?', l.qty, l.p.id);
    }
    if (cp.coupon) run('UPDATE coupons SET used = used + 1 WHERE id = ?', cp.coupon);
    run('COMMIT');
  } catch (err) {
    run('ROLLBACK');
    return res.status(500).json({ error: 'Could not place order', detail: err.message });
  }

  const order = q('SELECT * FROM orders WHERE id = ?', orderId);
  const orderItems = qa('SELECT * FROM order_items WHERE order_id = ?', orderId);

  sendMail(customer.email, 'Order ' + orderId + ' received — The Ocean Watches',
    `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e5e5;border-radius:14px;overflow:hidden">
      <div style="background:#0b1020;color:#f5e7b8;padding:20px 24px"><h2 style="margin:0">The Ocean Watches</h2></div>
      <div style="padding:24px">
        <h3 style="margin-top:0">Thank you, ${order.name}!</h3>
        <p>Your order <b>${order.id}</b> (${fmt(order.total)}) is being prepared.
        ${payment_method === 'cod' ? 'You will pay in cash on delivery.' : 'Complete your payment to confirm your order.'}</p>
        <table style="width:100%;border-collapse:collapse">${orderItems.map(it => `
          <tr><td style="padding:8px 0;border-top:1px solid #eee">${it.name} &times; ${it.qty}</td><td style="text-align:right;padding:8px 0;border-top:1px solid #eee">${fmt(it.price * it.qty)}</td></tr>`).join('')}
          <tr><td style="padding:8px 0;border-top:1px solid #eee"><b>Total</b></td><td style="text-align:right;padding:8px 0;border-top:1px solid #eee"><b>${fmt(order.total)}</b></td></tr>
        </table>
      </div></div>`);

  res.status(201).json({
    order: {
      id: order.id, subtotal: order.subtotal, discount: order.discount,
      total: order.total, status: order.status, payment_status: order.payment_status,
      coupon: order.coupon_code, created_at: order.created_at,
      items: orderItems.map(it => ({ product_id: it.product_id, name: it.name, price: it.price, qty: it.qty }))
    }
  });
});

/* Gateway-init for an existing order (used when card/online chosen after order creation). */
r.post('/:id/initiate', async (req, res) => {
  const order = q('SELECT * FROM orders WHERE id = ?', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const gateway = (req.body && req.body.gateway) || 'sandbox';
  const payload = await initGateway({ gateway, order });
  res.json(payload);
});

/* Customer order history */
r.get('/my', requireAuth, (req, res) => {
  const orders = qa('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', req.user.uid);
  res.json({ orders: orders.map(o => ({
    id: o.id, total: o.total, subtotal: o.subtotal, discount: o.discount,
    status: o.status, payment_status: o.payment_status, payment_method: o.payment_method,
    created_at: o.created_at, items: qa('SELECT * FROM order_items WHERE order_id = ?', o.id)
  })) });
});

export default r;
