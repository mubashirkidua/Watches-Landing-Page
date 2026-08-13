import { Router } from 'express';
import { q, qa, run } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware.js';
import { sendMail, MAIL_ENABLED } from '../lib/mail.js';

const r = Router();

r.use(requireAuth, requireAdmin);

/* Dashboard stats */
r.get('/stats', (req, res) => {
  const revenue = q(`SELECT COALESCE(SUM(total), 0) AS v FROM orders WHERE payment_status IN ('paid', 'cod') AND status != 'cancelled'`).v;
  const unpaid = q(`SELECT COALESCE(SUM(total), 0) AS v FROM orders WHERE payment_status = 'unpaid' AND status != 'cancelled'`).v;
  const ordersCount = q('SELECT COUNT(*) AS c FROM orders').c;
  const customersCount = q(`SELECT COUNT(*) AS c FROM users WHERE role = 'customer'`).c;
  const pendingOrders = q(`SELECT COUNT(*) AS c FROM orders WHERE status IN ('pending','confirmed')`).c;
  const lowStock = qa('SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 8');
  const recentOrders = qa(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`).map(o => ({
    id: o.id, name: o.name, total: o.total, status: o.status, payment_status: o.payment_status, created_at: o.created_at
  }));
  const byStatus = qa('SELECT status, COUNT(*) AS c FROM orders GROUP BY status');
  const byCategory = qa(`SELECT p.category, COALESCE(SUM(oi.qty), 0) AS sold FROM products p
                         LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.category`);
  res.json({
    revenue, unpaid, ordersCount, customersCount, pendingOrders,
    lowStock, recentOrders, byStatus, byCategory,
    mailEnabled: MAIL_ENABLED
  });
});

/* Orders management */
r.get('/orders', (req, res) => {
  const { status, q: query } = req.query;
  let sql = 'SELECT * FROM orders';
  const args = [];
  if (status && status !== 'all') { sql += ' WHERE status = ?'; args.push(status); }
  if (query) {
    sql += (args.length ? ' AND' : ' WHERE') + ' (id LIKE ? OR name LIKE ? OR email LIKE ?)';
    const like = '%' + query + '%';
    args.push(like, like, like);
  }
  const orders = qa(sql + ' ORDER BY created_at DESC', ...args).map(o => ({
    ...o, items: qa('SELECT * FROM order_items WHERE order_id = ?', o.id)
  }));
  res.json({ orders });
});

r.patch('/orders/:id', (req, res) => {
  const order = q('SELECT * FROM orders WHERE id = ?', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { status, payment_status } = req.body || {};
  if (!status && !payment_status) return res.status(400).json({ error: 'Nothing to update' });
  if (status) {
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    if (status === 'cancelled' && order.payment_status === 'paid') {
      /* refund flow placeholder: mark refunded + restock */
      run("UPDATE products SET stock = stock + (SELECT COALESCE(SUM(qty),0) FROM order_items WHERE order_id = ?) WHERE id IN (SELECT product_id FROM order_items WHERE order_id = ?)",
        order.id, order.id);
      run(`UPDATE orders SET payment_status = 'refunded' WHERE id = ?`, order.id);
    }
    run('UPDATE orders SET status = ? WHERE id = ?', status, order.id);
  }
  if (payment_status) {
    run('UPDATE orders SET payment_status = ? WHERE id = ?', payment_status, order.id);
  }
  const updated = q('SELECT * FROM orders WHERE id = ?', order.id);
  if (status && ['shipped', 'delivered', 'cancelled'].includes(status)) {
    sendMail(order.email, 'Order ' + order.id + ' — ' + status.toUpperCase() + ' — The Ocean Watches',
      `<p>Hi ${order.name},</p><p>Your order <b>${order.id}</b> has been marked as <b>${status.toUpperCase()}</b>.</p>`);
  }
  res.json({ order: { ...updated, items: qa('SELECT * FROM order_items WHERE order_id = ?', updated.id) } });
});

/* Customers */
r.get('/customers', (req, res) => {
  const customers = qa(`SELECT u.id, u.name, u.email, u.phone, u.city, u.created_at,
      (SELECT COUNT(*) FROM orders o WHERE o.customer_id = u.id) AS order_count,
      (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.customer_id = u.id) AS spend
    FROM users u WHERE u.role = 'customer' ORDER BY u.created_at DESC`);
  res.json({ customers });
});

r.get('/customers/:id', (req, res) => {
  const u = q('SELECT * FROM users WHERE id = ?', req.params.id);
  if (!u || u.role !== 'customer') return res.status(404).json({ error: 'Customer not found' });
  const orders = qa('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', u.id);
  res.json({ customer: u, orders });
});

export default r;
