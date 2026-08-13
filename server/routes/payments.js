import { Router } from 'express';
import crypto from 'node:crypto';
import { q, run } from '../db.js';
import { sendMail } from '../lib/mail.js';
import { getPayment, setPaymentStatus, initGateway, sandboxPage } from '../lib/payments.js';

const r = Router();

const fmt = n => 'Rs. ' + Number(n).toLocaleString('en-IN');

/* Initiate a gateway checkout for an existing order */
r.post('/checkout', async (req, res) => {
  const { orderId, gateway = 'sandbox' } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId is required' });
  const order = q('SELECT * FROM orders WHERE id = ?', orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const payload = await initGateway({ gateway, order });
  res.json(payload);
});

/* Sandbox gateway pages */
r.get('/sandbox/:id', (req, res) => {
  const payment = getPayment(req.params.id);
  if (!payment) return res.status(404).send('Payment not found');
  const order = q('SELECT * FROM orders WHERE id = ?', payment.order_id);
  if (!order) return res.status(404).send('Order not found');
  res.type('html').send(sandboxPage(payment, order));
});

r.post('/sandbox/:id/approve', (req, res) => {
  const payment = getPayment(req.params.id);
  if (!payment) return res.status(404).send('Payment not found');
  const txn = 'sand_' + crypto.randomBytes(8).toString('hex');
  setPaymentStatus(payment.id, 'paid', txn);
  run(`UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = ?`, payment.order_id);
  const order = q('SELECT * FROM orders WHERE id = ?', payment.order_id);
  sendMail(order.email, 'Payment confirmed for ' + order.id + ' — The Ocean Watches',
    `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e5e5;border-radius:14px;overflow:hidden">
      <div style="background:#0b1020;color:#f5e7b8;padding:20px 24px"><h2 style="margin:0">The Ocean Watches</h2></div>
      <div style="padding:24px"><p>Hi ${order.name},</p>
      <p>Payment of <b>${fmt(payment.amount)}</b> for order <b>${order.id}</b> is confirmed. Your timepiece will ship within 24 hours.</p>
      <p style="color:#888">Transaction: ${txn}</p></div></div>`);
  res.type('html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Payment approved</title></head>
<body style="font-family:Segoe UI,sans-serif;background:#0b1020;color:#e8ecf4;display:grid;place-items:center;min-height:100vh">
<div style="text-align:center"><h1 style="color:#ffd97a">Payment approved</h1>
<p>Order <b>${order.id}</b> paid (${fmt(payment.amount)}).</p>
<p><a href="/index.html" style="color:#7fb3ff">Back to store</a></p></div></body></html>`);
});

r.post('/sandbox/:id/decline', (req, res) => {
  const payment = getPayment(req.params.id);
  if (!payment) return res.status(404).send('Payment not found');
  setPaymentStatus(payment.id, 'failed', null);
  res.type('html').send('<!doctype html><html><head><meta charset="utf-8"><title>Payment declined</title></head>' +
    '<body style="font-family:Segoe UI,sans-serif;background:#0b1020;color:#e8ecf4;display:grid;place-items:center;min-height:100vh">' +
    '<div style="text-align:center"><h1 style="color:#ff7a7a">Payment declined</h1><p>Order ' + payment.order_id + ' remains unpaid.</p>' +
    '<p><a href="/index.html" style="color:#7fb3ff">Back to store</a></p></div></body></html>');
});

/* Generic webhook stub for real gateways (Stripe / JazzCash / Easypaisa).
   In production validate the signature for each provider and only then mark paid. */
r.post('/webhook/:gateway', (req, res) => {
  const { gateway } = req.params;
  const body = req.body || {};
  const orderId = body.order_id || body.orderId || (body.data && body.data.order_id);
  const ok = body.status === 'paid' || body.paid === true || body.responseCode === '000';
  if (!orderId) return res.status(400).json({ error: 'Missing order reference' });
  const order = q('SELECT * FROM orders WHERE id = ?', orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (ok) {
    run(`UPDATE orders SET payment_status = 'paid', status = 'confirmed', payment_method = ? WHERE id = ?`, gateway, orderId);
    const payment = q('SELECT * FROM payments WHERE order_id = ? AND status = ?', orderId, 'pending');
    if (payment) setPaymentStatus(payment.id, 'paid', body.txn_id || (gateway + '_' + crypto.randomBytes(6).toString('hex')));
    sendMail(order.email, 'Payment confirmed for ' + order.id + ' — The Ocean Watches',
      '<p>Payment for order <b>' + order.id + '</b> confirmed via ' + gateway + '.</p>');
  }
  res.json({ ok: true });
});

export default r;
