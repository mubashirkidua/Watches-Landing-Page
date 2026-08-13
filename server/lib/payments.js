import crypto from 'node:crypto';
import { run, q } from '../db.js';

function pid() { return 'pay_' + crypto.randomBytes(6).toString('hex'); }

export function createPayment({ orderId, amount, gateway }) {
  const id = pid();
  run('INSERT INTO payments (id, order_id, gateway, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    id, orderId, amount, gateway, 'pending', new Date().toISOString());
  return id;
}

export function getPayment(id) { return q('SELECT * FROM payments WHERE id = ?', id); }
export function setPaymentStatus(id, status, txnId) {
  run('UPDATE payments SET status = ?, txn_id = COALESCE(?, txn_id) WHERE id = ?', status, txnId || null, id);
}

/* Build a gateway-specific checkout payload for an order. */
export async function initGateway({ gateway, order }) {
  const amount = order.total;

  if (gateway === 'sandbox' || gateway === 'card') {
    const id = createPayment({ orderId: order.id, amount, gateway: 'sandbox' });
    return { gateway: 'sandbox', url: '/api/payments/sandbox/' + id, amount };
  }

  if (gateway === 'stripe') {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return { gateway: 'stripe', error: 'not_configured', message: 'STRIPE_SECRET_KEY is not set. Orders are created but payment is pending.' };
    }
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        amount: String(amount),
        currency: process.env.STRIPE_CURRENCY || 'usd',
        metadata: { order_id: order.id }
      })
    });
    const data = await res.json();
    if (!res.ok) return { gateway: 'stripe', error: 'gateway_error', message: data.error?.message || 'Stripe error' };
    createPayment({ orderId: order.id, amount, gateway: 'stripe' });
    return { gateway: 'stripe', clientSecret: data.client_secret, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '', amount };
  }

  if (gateway === 'jazzcash' || gateway === 'easypaisa') {
    const merchant = process.env[gateway.toUpperCase() + '_MERCHANT_ID'];
    if (!merchant) {
      return { gateway, error: 'not_configured', message: gateway.toUpperCase() + ' merchant credentials are not set.' };
    }
    createPayment({ orderId: order.id, amount, gateway });
    return {
      gateway,
      redirectUrl: process.env[gateway.toUpperCase() + '_REDIRECT'],
      form: {
        merchantId: merchant,
        orderId: order.id,
        amount,
        returnUrl: process.env.BASE_URL + '/api/payments/return/' + gateway
      }
    };
  }

  return { gateway, error: 'unsupported', message: 'Unknown gateway: ' + gateway };
}

/* Simulated sandbox gateway page (server-rendered). */
export function sandboxPage(payment, order) {
  const fmt = n => 'Rs. ' + Number(n).toLocaleString('en-IN');
  const approve = '/api/payments/sandbox/' + payment.id + '/approve';
  const decline = '/api/payments/sandbox/' + payment.id + '/decline';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sandbox Payment</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0b1020;color:#e8ecf4;display:grid;place-items:center;min-height:100vh;margin:0}
  .card{background:#131a2e;border:1px solid #26304d;border-radius:18px;padding:34px;width:min(92vw,420px);box-shadow:0 30px 80px rgba(0,0,0,.5)}
  h1{font-size:20px;margin:0 0 4px;color:#f5e7b8}.sub{color:#8b96b5;font-size:13px;margin-bottom:20px}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid #222c47;font-size:14px}
  .row b{color:#ffd97a}
  .btns{display:grid;gap:10px;margin-top:24px}
  button{padding:13px;border-radius:12px;border:0;font-size:15px;cursor:pointer;font-weight:600}
  .ok{background:linear-gradient(135deg,#0e7a4e,#16a26a);color:#fff}
  .no{background:#2a3350;color:#cdd5ea}
  .note{margin-top:16px;font-size:12px;color:#77809c;text-align:center}
</style></head><body><div class="card">
  <h1>Ocean Sandbox Gateway</h1>
  <div class="sub">Simulated payment &middot; no real charge</div>
  <div class="row"><span>Order</span><b>${order.id}</b></div>
  <div class="row"><span>Gateway</span><b>${payment.gateway.toUpperCase()}</b></div>
  <div class="row"><span>Amount</span><b>${fmt(payment.amount)}</b></div>
  <div class="btns">
    <form method="POST" action="${approve}"><button class="ok">Approve &amp; Pay ${fmt(payment.amount)}</button></form>
    <form method="POST" action="${decline}"><button class="no">Decline payment</button></form>
  </div>
  <div class="note">This page stands in for a real gateway (Stripe / JazzCash / Easypaisa). Configure credentials in <code>.env</code> to go live.</div>
</div></body></html>`;
}
