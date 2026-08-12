/* ============================================================
   THE OCEAN WATCHES — Shared Partials (Nav + Footer injection)
   ============================================================ */
(function () {
  'use strict';

  var page = document.body.dataset.page || 'home';

  var icons = {
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.6 12.2a1.5 1.5 0 0 0 1.47 1.2h7.9a1.5 1.5 0 0 0 1.46-1.16L20.5 9H6.1"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.24-1.46 1.49-1.46h1.6V4.4c-.28-.04-1.23-.12-2.34-.12-2.31 0-3.9 1.41-3.9 4v2.22H7.7v3h2.65V21z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.7 3h3l-6.6 7.5L22 21h-6.1l-4.8-6.2L5.6 21h-3l7.1-8.1L2 3h6.3l4.3 5.7zm-1.1 16.2h1.7L7.5 4.7H5.7z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.5v-7l6 3.5z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2.05z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.22.63-1.3 1.2-1.8 1.24-.48.05-1.08.24-3.64-.76-3.08-1.2-5.03-4.33-5.18-4.53-.15-.2-1.24-1.65-1.24-3.15s.79-2.23 1.07-2.53c.28-.3.6-.38.8-.38h.58c.18 0 .43-.07.67.51.24.6.83 2.05.9 2.2.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.38 1.47.3.15.47.13.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.76.83 2.06.98.3.15.5.22.58.35.07.13.07.75-.15 1.37z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.8"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v18M8 21h8"/><path d="M4 7h16"/><path d="m4 7-3 6.5a3.5 3.5 0 0 0 6 0L4 7zm16 0-3 6.5a3.5 3.5 0 0 0 6 0L20 7z"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 6 6M22 9l-6 6"/></svg>',
    wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>'
  };

  var isActive = function (key) { return page === key ? 'active' : ''; };

  var navHTML =
'<div class="container nav-inner">' +
  '<a class="brand" href="index.html" aria-label="The Ocean Watches — home">' +
    '<img class="brand-logo" src="assets/svg/logo.svg" alt="The Ocean Watches logo" width="52" height="52">' +
    '<span class="brand-text"><strong>The Ocean Watches</strong><span>Luxury Timepieces</span></span>' +
  '</a>' +
  '<nav class="nav-links" aria-label="Primary navigation">' +
    '<a class="nav-link ' + isActive('home') + '" href="index.html">Home</a>' +
    '<a class="nav-link ' + isActive('luxury') + '" href="luxury.html">Luxury</a>' +
    '<a class="nav-link ' + isActive('collection') + '" href="collection.html">Collection</a>' +
    '<a class="nav-link ' + isActive('about') + '" href="about.html">CEO Profile</a>' +
  '</nav>' +
  '<div class="nav-cta">' +
    '<button class="icon-btn" data-search aria-label="Search timepieces" type="button">' + icons.search + '</button>' +
    '<button class="icon-btn" data-compare aria-label="Compare watches" type="button">' + icons.scale + '<span class="count-pill count-compare" style="display:none">0</span></button>' +
    '<button class="icon-btn icon-sound" data-sound aria-label="Sound effects: off" aria-pressed="false" type="button">' +
      '<span class="snd-on">' + icons.soundOn + '</span>' +
      '<span class="snd-off">' + icons.soundOff + '</span>' +
    '</button>' +
    '<button class="icon-btn" data-cart aria-label="Shopping cart" type="button">' + icons.cart + '<span class="count-pill count-cart" style="display:none">0</span></button>' +
    '<button class="icon-btn" data-wish aria-label="Wishlist" type="button">' + icons.heart + '<span class="count-pill count-wish" style="display:none">0</span></button>' +
    '<a class="btn btn-gold btn-sm" href="collection.html">Shop Now</a>' +
  '</div>' +
  '<button class="burger" aria-label="Open menu" aria-expanded="false" type="button"><span></span><span></span><span></span></button>' +
'</div>';

  var mobileHTML =
'<div class="mobile-menu" id="mobileMenu">' +
  '<a href="index.html">Home</a>' +
  '<a href="luxury.html">Luxury</a>' +
  '<a href="collection.html">Collection</a>' +
  '<a href="about.html">CEO Profile</a>' +
  '<a class="btn btn-gold" href="collection.html" style="margin-top:1.5rem;font-family:var(--font-body);font-size:1rem">Shop Now</a>' +
'</div>';

  var footerHTML =
'<div class="container">' +
  '<div class="footer-grid">' +
    '<div>' +
      '<a class="brand" href="index.html">' +
        '<img class="brand-logo" src="assets/svg/logo.svg" alt="The Ocean Watches logo" width="52" height="52">' +
        '<span class="brand-text"><strong>The Ocean Watches</strong><span>Luxury Timepieces</span></span>' +
      '</a>' +
      '<p style="margin-top:1.4rem">A premium luxury watch company dedicated to timeless craftsmanship, elegant design, and exceptional quality for modern lifestyles.</p>' +
      '<div class="socials">' +
        '<a href="#" aria-label="Instagram">' + icons.instagram + '</a>' +
        '<a href="#" aria-label="Facebook">' + icons.facebook + '</a>' +
        '<a href="#" aria-label="X (Twitter)">' + icons.x + '</a>' +
        '<a href="https://wa.me/923428156086" aria-label="WhatsApp" target="_blank" rel="noopener">' + icons.whatsapp + '</a>' +
        '<a href="#" aria-label="YouTube">' + icons.youtube + '</a>' +
      '</div>' +
    '</div>' +
    '<div>' +
      '<h4>Explore</h4>' +
      '<ul class="footer-links">' +
        '<li><a href="index.html">Home</a></li>' +
        '<li><a href="luxury.html">Luxury Collection</a></li>' +
        '<li><a href="about.html">CEO Profile</a></li>' +
        '<li><a href="collection.html">Watch Collection</a></li>' +
        '<li><a href="index.html#story">Brand Story</a></li>' +
        '<li><a href="index.html#reviews">Reviews</a></li>' +
      '</ul>' +
    '</div>' +
    '<div>' +
      '<h4>Collections</h4>' +
      '<ul class="footer-links">' +
        '<li><a href="collection.html">Ocean Royal</a></li>' +
        '<li><a href="collection.html">Ocean Elite</a></li>' +
        '<li><a href="collection.html">Ocean Gold</a></li>' +
        '<li><a href="collection.html">Ocean Titanium</a></li>' +
        '<li><a href="collection.html">Ocean Prestige</a></li>' +
      '</ul>' +
    '</div>' +
    '<div>' +
      '<h4>Stay in the Current</h4>' +
      '<p>Subscribe for private previews, launch invites and timeless offers.</p>' +
      '<form class="newsletter-form" novalidate>' +
        '<input type="email" placeholder="Your email address" aria-label="Email address" required>' +
        '<button type="submit">Join</button>' +
      '</form>' +
      '<ul class="footer-contact" style="margin-top:1.4rem">' +
        '<li>' + icons.phone + '<a href="tel:+923232930657">0323-2930657</a></li>' +
        '<li>' + icons.whatsapp + '<a href="https://wa.me/923428156086" target="_blank" rel="noopener">0342-8156086</a></li>' +
        '<li>' + icons.mail + '<a href="mailto:alimuhammd98573@gmail.com">alimuhammd98573@gmail.com</a></li>' +
      '</ul>' +
    '</div>' +
  '</div>' +
  '<div class="footer-bottom">' +
    '<span>&copy; <span id="year">2026</span> The Ocean Watches. All rights reserved.</span>' +
    '<span>Crafted with ' + icons.wave.replace('width="1.7"', 'width="1.7"') + ' passion by Muhammad Mubashir Ali</span>' +
  '</div>' +
'</div>';

  document.getElementById('site-nav').innerHTML = navHTML + mobileHTML;
  document.getElementById('site-footer').innerHTML = footerHTML;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Cart drawer + checkout modal (injected on every page) ---------- */
  var closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  var drawerHTML =
'<div class="drawer-overlay" id="cartOverlay" hidden></div>' +
'<aside class="drawer" id="cartDrawer" aria-label="Shopping cart" aria-hidden="true">' +
  '<div class="drawer-head">' +
    '<h3>Your Cart <span class="drawer-count" id="drawerCount">0</span></h3>' +
    '<button class="modal-close" id="cartClose" aria-label="Close cart" type="button">' + closeIcon + '</button>' +
  '</div>' +
  '<div class="drawer-items" id="cartItems"></div>' +
  '<div class="drawer-empty" id="cartEmpty">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.6 12.2a1.5 1.5 0 0 0 1.47 1.2h7.9a1.5 1.5 0 0 0 1.46-1.16L20.5 9H6.1"/></svg>' +
    '<p>Your cart is empty.</p>' +
    '<a class="btn btn-gold" href="collection.html">Shop Now</a>' +
  '</div>' +
  '<div class="drawer-foot" id="cartFoot" hidden>' +
    '<div class="drawer-totals">' +
      '<div><span>Subtotal</span><strong id="drawerSub"></strong></div>' +
      '<div><span>Delivery</span><strong class="free">FREE</strong></div>' +
    '</div>' +
    '<button class="btn btn-gold btn-lg" id="cartCheckout" type="button">Secure Checkout</button>' +
    '<p class="drawer-note">Free nationwide delivery &middot; 5-year warranty &middot; 7-day returns</p>' +
  '</div>' +
'</aside>';

  var checkoutHTML =
'<div class="modal" id="checkout" role="dialog" aria-modal="true" aria-label="Secure checkout">' +
  '<div class="modal-panel checkout-panel">' +
    '<button class="modal-close" id="coClose" aria-label="Close checkout" type="button">' + closeIcon + '</button>' +
    '<div class="co-head" id="coHead">' +
      '<span class="eyebrow">Secure Checkout</span>' +
      '<div class="co-steps">' +
        '<span class="co-step-dot active" data-pos="1">1</span><i></i>' +
        '<span class="co-step-dot" data-pos="2">2</span><i></i>' +
        '<span class="co-step-dot" data-pos="3">3</span>' +
      '</div>' +
    '</div>' +
    '<div class="co-body">' +
      '<div class="co-step" data-step="1">' +
        '<h3 class="co-title">Review Your Order</h3>' +
        '<div class="co-items" id="coItems"></div>' +
        '<div class="co-totals">' +
          '<div><span>Subtotal</span><strong id="coSub"></strong></div>' +
          '<div><span>You Save</span><strong class="save" id="coSave"></strong></div>' +
          '<div><span>Delivery</span><strong class="free">FREE</strong></div>' +
          '<div class="co-grand"><span>Total Due</span><strong id="coTotal"></strong></div>' +
        '</div>' +
        '<button class="btn btn-gold btn-lg" id="coToDetails" type="button">Continue&nbsp;&nbsp;<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
      '</div>' +
      '<div class="co-step" data-step="2" hidden>' +
        '<h3 class="co-title">Delivery Details</h3>' +
        '<div class="co-form">' +
          '<label>Full Name<input id="coName" type="text" autocomplete="name" placeholder="e.g. Ahmed Khan"><span class="co-error"></span></label>' +
          '<label>Phone<input id="coPhone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="03XX-XXXXXXX"><span class="co-error"></span></label>' +
          '<label>Email<input id="coEmail" type="email" autocomplete="email" placeholder="you@example.com"><span class="co-error"></span></label>' +
          '<label class="co-full">Delivery Address<input id="coAddr" type="text" autocomplete="street-address" placeholder="House, street, area"><span class="co-error"></span></label>' +
          '<label>City<input id="coCity" type="text" autocomplete="address-level2" placeholder="e.g. Karachi"><span class="co-error"></span></label>' +
        '</div>' +
        '<div class="co-nav">' +
          '<button class="btn btn-ghost" id="coBack1" type="button">Back</button>' +
          '<button class="btn btn-gold" id="coToPay" type="button">Continue to Payment</button>' +
        '</div>' +
      '</div>' +
      '<div class="co-step" data-step="3" hidden>' +
        '<h3 class="co-title">Payment Method</h3>' +
        '<div class="co-paymethods" role="radiogroup" aria-label="Payment method">' +
          '<button class="co-pay active" data-pay="card" type="button" role="radio" aria-checked="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19M6 15.5h4"/></svg>' +
            '<span><strong>Credit / Debit Card</strong><small>Visa, Mastercard &amp; more</small></span>' +
          '</button>' +
          '<button class="co-pay" data-pay="cod" type="button" role="radio" aria-checked="false">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 7h20v10H2z"/><path d="M6 11h4M6 14h8"/></svg>' +
            '<span><strong>Cash on Delivery</strong><small>Pay when it arrives</small></span>' +
          '</button>' +
        '</div>' +
        '<div class="co-card" id="coCardForm">' +
          '<div class="card-preview" aria-hidden="true">' +
            '<div class="cp-top"><span class="cp-brand" id="cpBrand">CARD</span><span class="cp-wave">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 17c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>' +
            '</span></div>' +
            '<div class="cp-chip"></div>' +
            '<div class="cp-num" id="cpNum">•••• •••• •••• ••••</div>' +
            '<div class="cp-bottom"><div><small>Card Holder</small><strong id="cpName">YOUR NAME</strong></div><div><small>Expires</small><strong id="cpExp">MM/YY</strong></div></div>' +
          '</div>' +
          '<div class="co-form">' +
            '<label>Name on Card<input id="coCardName" type="text" placeholder="As printed on card"><span class="co-error"></span></label>' +
            '<label>Card Number<input id="coCardNum" type="text" inputmode="numeric" placeholder="1234 5678 9012 3456" maxlength="23"><span class="co-error"></span></label>' +
            '<label class="co-sm">Expiry (MM/YY)<input id="coCardExp" type="text" inputmode="numeric" placeholder="MM/YY" maxlength="5"><span class="co-error"></span></label>' +
            '<label class="co-sm">CVV<input id="coCardCvv" type="password" inputmode="numeric" placeholder="•••" maxlength="4"><span class="co-error"></span></label>' +
          '</div>' +
        '</div>' +
        '<div class="co-cod-note" id="coCodNote" hidden>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16.5 7.5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h3"/><rect x="8" y="3" width="8" height="5" rx="1.5"/></svg>' +
          '<p>Pay in cash when your Ocean arrives. Our courier will carry change if needed, and you can inspect the watch before paying.</p>' +
        '</div>' +
        '<div class="co-paybar">' +
          '<button class="btn btn-gold btn-lg" id="coPay" type="button">Pay Rs 0</button>' +
          '<p class="co-secure">256-bit encrypted &middot; PCI-DSS compliant &middot; Demo checkout &mdash; no real charge</p>' +
        '</div>' +
      '</div>' +
      '<div class="co-step co-processing" data-step="4" hidden>' +
        '<div class="co-spinner"></div>' +
        '<h3 class="co-title">Processing Payment</h3>' +
        '<p>Contacting your bank securely &hellip;</p>' +
      '</div>' +
      '<div class="co-step co-success" data-step="5" hidden>' +
        '<div class="co-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg></div>' +
        '<h3 class="co-title">Order Confirmed</h3>' +
        '<p class="co-orderid">Order <strong id="coOrderId"></strong></p>' +
        '<p class="co-success-note" id="coSuccessNote"></p>' +
        '<div class="co-success-box" id="coSuccessBox"></div>' +
        '<div class="co-success-actions">' +
          '<a class="btn btn-gold" href="collection.html">Continue Shopping</a>' +
          '<a class="btn btn-ghost" href="index.html">Back to Home</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</div>';

  document.body.insertAdjacentHTML('beforeend', drawerHTML + checkoutHTML);

  /* ---------- Shared premium chrome (scroll progress, spotlight, search, compare) ---------- */
  var sharedHTML =
'<div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>' +
'<div id="cursor-spot" aria-hidden="true"></div>' +

'<div class="search-overlay" id="searchOverlay" aria-hidden="true">' +
  '<div class="search-panel">' +
    '<button class="modal-close" id="searchClose" aria-label="Close search" type="button">' + closeIcon + '</button>' +
    '<span class="eyebrow center">Search The Vault</span>' +
    '<div class="search-bar">' +
      icons.search +
      '<input id="searchInput" type="text" placeholder="Try &quot;Royal&quot;, &quot;Sapphire&quot;, &quot;Limited&quot;..." aria-label="Search watches" autocomplete="off">' +
      '<kbd>Esc</kbd>' +
    '</div>' +
    '<div class="search-results" id="searchResults" role="list"></div>' +
    '<p class="search-empty" id="searchEmpty" hidden>No timepieces found for that query.</p>' +
  '</div>' +
'</div>' +

'<div class="drawer-overlay" id="compareOverlay" hidden></div>' +
'<aside class="drawer compare-drawer" id="compareDrawer" aria-label="Compare watches" aria-hidden="true">' +
  '<div class="drawer-head">' +
    '<h3>Compare <span class="drawer-count" id="compareCount">0/3</span></h3>' +
    '<button class="modal-close" id="compareClose" aria-label="Close compare" type="button">' + closeIcon + '</button>' +
  '</div>' +
  '<p class="drawer-note cmp-note">Pick up to three timepieces to compare side by side.</p>' +
  '<div class="compare-slots" id="compareSlots"></div>' +
  '<div class="drawer-foot" id="compareFoot">' +
    '<button class="btn btn-gold btn-lg" id="compareGo" type="button" disabled>Compare Now</button>' +
  '</div>' +
'</aside>' +

'<div class="modal" id="compareModal" role="dialog" aria-modal="true" aria-label="Watch comparison">' +
  '<div class="modal-panel compare-panel">' +
    '<button class="modal-close" id="compareModalClose" aria-label="Close comparison" type="button">' + closeIcon + '</button>' +
    '<span class="eyebrow center">The Ocean Watches</span>' +
    '<h2 class="section-title center cmp-title">Side by Side</h2>' +
    '<div class="compare-table-wrap"><table class="compare-table" id="compareTable"></table></div>' +
    '<div class="compare-modal-actions">' +
      '<a class="btn btn-gold" href="collection.html">Shop These Watches</a>' +
    '</div>' +
  '</div>' +
'</div>';

  document.body.insertAdjacentHTML('beforeend', sharedHTML);

  /* nav: search / compare / sound buttons */
  var searchBtn = document.querySelector('[data-search]');
  if (searchBtn) searchBtn.addEventListener('click', function () {
    if (window.owOpenSearch) window.owOpenSearch(); else window.location.href = 'collection.html';
  });
  var compareBtn = document.querySelector('[data-compare]');
  if (compareBtn) compareBtn.addEventListener('click', function () {
    if (window.owOpenCompare) window.owOpenCompare();
  });
  var soundBtn = document.querySelector('[data-sound]');
  if (soundBtn) soundBtn.addEventListener('click', function () {
    if (window.owToggleSound) window.owToggleSound();
  });

  /* cart / wishlist pill behaviour */
  var cartBtn = document.querySelector('[data-cart]');
  var wishBtn = document.querySelector('[data-wish]');
  if (cartBtn) cartBtn.addEventListener('click', function () {
    if (window.owOpenCart) window.owOpenCart(); else window.location.href = 'collection.html';
  });
  if (wishBtn) wishBtn.addEventListener('click', function () { window.location.href = 'collection.html'; });

  /* keep accessible labels updated from count later; main.js handles pills */
})();
