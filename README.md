# The Ocean Watches — Luxury Watch Store (Full Stack)

A premium luxury watch brand store. Four pages, dark luxury theme, glassmorphism,
3D floating product art, scroll animations, quick-view product modals, cart &
wishlist, search, compare, a full 10-watch collection, plus a complete backend:
REST API, SQLite database, customer accounts, real order processing with inventory,
coupons, an admin panel, and a pluggable payment-gateway layer.

## Pages

| Page | File | Description |
| ---- | ---- | ----------- |
| Home | `index.html` | Hero, marquee, brand story, featured collection, stats, why-choose-us, experience, reviews, Instagram gallery, FAQ, CTA |
| Luxury | `luxury.html` | Editorial luxury showcase — hero, artisan journey, bespoke services, limited editions, press, invitation CTA |
| CEO Profile | `about.html` | Executive portrait, bio, contact cards, timeline, achievements, values, signature |
| Collection | `collection.html` | 10 product cards, live filtering, quick view modal, add to cart / buy / wishlist |
| Admin | `/admin` | Admin console (see below) |

## Structure

```
.
├── index.html / luxury.html / about.html / collection.html
├── admin/                     (admin panel — login, dashboard, CRUD)
│   ├── index.html
│   ├── admin.css
│   └── admin.js
├── assets/
│   ├── css/                   (style, products, home, luxury, about, collection)
│   ├── js/
│   │   ├── partials.js        (shared nav + footer + modals injection)
│   │   ├── products.js        (catalogue seed data → window.OW_PRODUCTS)
│   │   └── main.js            (UI: loader, reveal, tilt, cart, quick view, search,
│   │                            compare, checkout, account modal, API calls)
│   └── svg/                   (hand-built luxury SVG artwork)
├── server/                    (Node.js backend — Express + node:sqlite)
│   ├── server.js              (static + API + admin serving)
│   ├── db.js                  (schema, seeding from products.js)
│   ├── middleware.js          (JWT auth, admin guard)
│   ├── routes/                (auth, products, orders, coupons, payments, admin)
│   ├── lib/                   (mailer, payment gateway abstraction)
│   └── .env.example
├── package.json
└── start.sh                   (installs deps + runs the server on :4173)
```

## Run

```bash
bash start.sh
```

Open:
- Storefront → http://localhost:4173
- Admin panel → http://localhost:4173/admin  (`admin@oceanwatches.com` / `admin123`)
- API health → http://localhost:4173/api/health

Configuration lives in `server/.env` (copy `server/.env.example`). No config is
required to run — SQLite database, admin user, and 10-product catalogue are
created automatically on first start (`server/data/ocean.sqlite`).

## Backend & API

Node 22+ (uses the built-in `node:sqlite` — no native builds). Key endpoints:

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| POST | `/api/auth/register` | Create a customer account |
| POST | `/api/auth/login` | Customer login (JWT) |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/products` | Public catalogue (stock-aware) |
| POST | `/api/orders` | Place an order — server-side pricing, stock decrement, coupon, confirmation email |
| GET | `/api/orders/my` | Signed-in customer's order history |
| POST | `/api/coupons/validate` | Validate a promo code against a subtotal |
| POST | `/api/payments/checkout` | Initiate a gateway checkout (sandbox / stripe / jazzcash / easypaisa) |
| POST | `/api/payments/webhook/:gateway` | Payment-confirmation webhook stub |
| GET/POST/PUT/DELETE | `/api/admin/...` | Stats, orders, customers, products, coupons (admin JWT) |

Auth is JWT (`Bearer <token>`). Admin routes require `role: admin`.

## Admin Panel

Login at `/admin`, then:

- **Dashboard** — revenue, unpaid total, order/customer counts, low-stock warnings, recent orders, sales by status and category.
- **Products** — add / edit / delete watches (price, stock, badge, featured).
- **Orders** — filter + search, expand items, change status (pending → confirmed → shipped → delivered / cancelled). Cancelling a paid order restocks and marks refunded.
- **Customers** — registered customers with order counts and lifetime spend.
- **Coupons** — create / edit / delete promo codes (percent or flat, min order, usage limit, expiry).

## Cart & Checkout

- **Cart drawer** — adjust quantities, remove items, live subtotal. State persists in `localStorage` (`ow_cart`).
- **Buy Now** — opens checkout directly for a watch.
- **Checkout steps** — review → delivery details (validated) → payment.
- **Payment methods**
  - **Credit / Debit card** — card formatting, Visa/Mastercard/Amex detection, expiry + Luhn validation, then a real order is created server-side and the sandbox gateway opens to complete payment.
  - **Cash on Delivery** — pay on arrival; order is confirmed immediately.
- **Accounts** — sign in / create account from the user icon. Order history is fetched from the API (`/api/orders/my`) for signed-in users.
- **Confirmation** — server-generated order ID (`OW-YYYY-XXXXXX`), receipt, order confirmation email, and inventory decrement.
- **Coupons** — `OCEAN10` (10% off) and `OCEAN50` (Rs 50,000 off) ship pre-seeded.

### Going live with a real payment gateway

1. **Sandbox (default, works out of the box):** the server renders a simulated gateway page; "Approve" marks the order paid and sends the payment-confirmation email. Perfect for demos and client reviews.
2. **Stripe:** set `STRIPE_SECRET_KEY` (+ `STRIPE_PUBLISHABLE_KEY`) in `server/.env`. `POST /api/payments/checkout { gateway: "stripe" }` then returns a PaymentIntent `clientSecret`.
3. **JazzCash / Easypaisa:** set `JAZZCASH_MERCHANT_ID` / `EASYPAISA_MERCHANT_ID` and their redirect URLs. Checkout returns the form fields to redirect the customer to the bank portal.
4. **Webhooks:** point the gateway's server-to-server notification at `POST /api/payments/webhook/:gateway` and (for production) add signature verification per provider — the handler currently marks the order paid when the payload reports success.

### Emails

Order confirmation + payment confirmation + shipment status emails. Without SMTP config they are logged to the server console and stored in the `email_log` table. To send real mail, set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `server/.env`.

## Notes

- All watch imagery is custom inline/SVG artwork — no external raster dependencies.
- The 10-watch catalogue is seeded into the database from `assets/js/products.js`; the admin panel edits the database copy (server is the source of truth for pricing, stock and orders).
- The navbar + footer are injected everywhere from `assets/js/partials.js` — a page's `<body data-page>` keeps the matching link highlighted.
