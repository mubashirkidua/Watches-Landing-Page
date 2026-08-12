# The Ocean Watches — Luxury Watch Website

A premium luxury watch brand website. Four pages, dark luxury theme, glassmorphism,
3D floating product art, scroll animations, quick-view product modals, cart &
wishlist state, CEO executive profile, a full 10-watch collection, and a dedicated
haute-horlogerie luxury page.

## Pages

| Page | File | Description |
| ---- | ---- | ----------- |
| Home | `index.html` | Hero, marquee, brand story, featured collection, stats, why-choose-us, experience, reviews, Instagram gallery, FAQ, CTA |
| Luxury | `luxury.html` | Editorial luxury showcase — hero, artisan journey, bespoke services, limited editions, press, invitation CTA |
| CEO Profile | `about.html` | Executive portrait, bio, contact cards, timeline, achievements, values, signature |
| Collection | `collection.html` | 10 product cards, live filtering, quick view modal, add to cart / buy / wishlist |

## Structure

```
.
├── index.html / luxury.html / about.html / collection.html
├── assets/
│   ├── css/
│   │   ├── style.css        (design tokens, base, components, animations)
│   │   ├── products.css     (product cards + quick view modal)
│   │   ├── home.css         (home page sections)
│   │   ├── luxury.css       (luxury page)
│   │   ├── about.css        (CEO profile page)
│   │   └── collection.css   (collection page)
│   ├── js/
│   │   ├── partials.js      (shared nav + footer injection)
│   │   ├── products.js      (catalogue data → window.OW_PRODUCTS)
│   │   └── main.js          (loader, reveal, counters, cursor, tilt, cart/wishlist, quick view, filters, forms)
│   └── svg/                 (hand-built luxury SVG artwork)
│       ├── logo.svg         (brand mark)
│       ├── ceo.svg          (executive portrait)
│       └── watches/         (10 watch renders incl. hero)
└── start.sh                 (serve on :4173)
```

## Run

```bash
bash start.sh
# or
python3 -m http.server 4173
```

Open http://localhost:4173

## Notes

- All watch imagery is custom inline/SVG artwork — no external raster dependencies.
- The 10-watch catalogue lives in `assets/js/products.js` (pricing + specs) and each model has a hand-built render in `assets/svg/watches/`.
- Filter chips on `collection.html` map 1:1 to the 10 catalogue models (Royal, Elite, Classic, Black, Gold, Titanium, Premium, Prestige, Sapphire, Diamond).
- The navbar + footer are injected everywhere from `assets/js/partials.js` — a page's `<body data-page>` keeps the matching link highlighted.

## Cart & Checkout

A fully client-side cart + checkout flow ships with the site — no backend required:

- **Cart drawer** — click the cart icon in the navbar. Adjust quantities, remove items, and see live subtotal. State persists in `localStorage` (`ow_cart`).
- **Buy Now** — on any product card or the quick-view modal opens checkout directly for that watch.
- **Checkout steps** — order review → delivery details (validated) → payment.
- **Payment methods**
  - **Credit / Debit card** — live card-number formatting, Visa/Mastercard/Amex detection, a stylized card preview, expiry + Luhn validation. This is a demo checkout: no real charge is made.
  - **Cash on Delivery** — pay on arrival; no card details needed.
- **Order confirmation** — simulated processing, generated order ID (`OW-YYYY-XXXXXX`), receipt summary, and order history persisted in `localStorage` (`ow_orders`).

### Connecting a live payment gateway

To go live, replace the simulated `coPayBtn` handler in `assets/js/main.js` (the `/* ---------- Pay ---------- */` section) with a call to your gateway (e.g. Stripe, JazzCash, Easypaisa, Sadapay). Keep the existing validation; send the `order` object and payment token to your backend to create the charge and store the order server-side.
