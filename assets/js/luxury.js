/* ============================================================
   THE OCEAN WATCHES — Luxury Collection Showroom
   Hero title letters · Orbital gallery · Collection grid
   (cart / wishlist / quick-view / checkout handled by main.js)
   ============================================================ */
(function () {
  'use strict';

  const products = window.OW_PRODUCTS || [];

  const fmtRs = n => 'Rs ' + n.toLocaleString('en-US');

  /* ---------- Split the hero title into animated letters ---------- */
  const titleEl = document.getElementById('luxTitle');
  if (titleEl) {
    const words = titleEl.textContent.trim().split(/\s+/);
    let li = 0;
    titleEl.innerHTML = words.map(w =>
      '<span class="word">' + w.split('').map(c =>
        '<span class="char" style="--li:' + li++ + '">' + c + '</span>'
      ).join('') + '</span>'
    ).join(' ');
  }

  /* ---------- Orbital gallery ---------- */
  const stage = document.getElementById('orbitStage');
  const ring = document.getElementById('orbitRing');
  if (stage && ring && products.length) {
    const frag = document.createDocumentFragment();
    products.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'orbit-item';
      item.style.setProperty('--i', i);
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'Quick view ' + p.name);
      item.dataset.quick = p.id;
      item.innerHTML =
        '<div class="orbit-inner">' +
        '<div class="orbit-disc">' +
          '<span class="orbit-spin">' +
            '<img src="' + p.img + '" alt="' + p.name + '" width="240" height="240" loading="lazy">' +
          '</span>' +
          '<span class="orbit-glass">' +
              '<strong>' + p.name + '</strong>' +
              '<span class="og-price">' + fmtRs(p.discount) + '</span>' +
              '<span class="og-rating">' + p.rating.toFixed(1) + ' \u2605</span>' +
            '</span>' +
          '</div>' +
        '</div>';
      frag.appendChild(item);
    });
    ring.appendChild(frag);

    ring.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('orbit-item')) {
        e.preventDefault();
        if (window.openQuickView) window.openQuickView(e.target.dataset.quick);
      }
    });
  }

  /* ---------- Collection grid built from the catalogue ---------- */
  const grid = document.getElementById('luxGrid');
  if (grid && products.length) {
    const d = i => ['', ' d-1', ' d-2', ' d-3'][i % 4];
    const eye = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    const heart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    const scale = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M8 21h8"/><path d="M4 7h16"/><path d="m4 7-3 6.5a3.5 3.5 0 0 0 6 0L4 7zm16 0-3 6.5a3.5 3.5 0 0 0 6 0L20 7z"/></svg>';

    grid.innerHTML = products.map((p, i) =>
      '<article class="product-card glass tilt reveal' + d(i) + '" data-category="' + p.category + '" aria-label="' + p.name + ' watch">' +
        '<div class="product-media">' +
          '<div class="product-badges"><span class="product-badge ' + p.badge.type + '">' + p.badge.label + '</span></div>' +
          '<span class="product-off">-' + p.off + '%</span>' +
          '<img src="' + p.img + '" alt="' + p.name + ' luxury watch" loading="lazy" width="480" height="620">' +
          '<div class="product-actions">' +
            '<button class="act-btn" data-quick="' + p.id + '" aria-label="Quick view ' + p.name + '">' + eye + '</button>' +
            '<button class="act-btn wish-btn" data-id="' + p.id + '" aria-label="Add ' + p.name + ' to wishlist">' + heart + '</button>' +
            '<button class="act-btn cmp-btn" data-id="' + p.id + '" aria-label="Compare ' + p.name + '">' + scale + '</button>' +
            '<button class="act-btn" data-quick="' + p.id + '" aria-label="Open quick view">' + arrow + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="product-body">' +
          '<h3 class="product-name">' + p.name + '</h3>' +
          '<p class="product-desc">' + p.desc + '</p>' +
          '<div class="product-meta"><span class="stars-inline" data-rating="' + p.rating + '"></span><span>(' + p.reviews + ' reviews)</span></div>' +
          '<div class="product-price"><strong>' + fmtRs(p.discount) + '</strong><s>' + fmtRs(p.original) + '</s><em>-' + p.off + '%</em></div>' +
          '<div class="product-cta">' +
            '<button class="btn btn-ghost add-btn" data-id="' + p.id + '" type="button">Add to Cart</button>' +
            '<button class="btn btn-gold buy-btn" data-buy="' + p.id + '" type="button">Buy Now</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    ).join('');

    const wishSet = new Set(JSON.parse(localStorage.getItem('ow_wishlist') || '[]'));
    grid.querySelectorAll('.wish-btn').forEach(btn => {
      const on = wishSet.has(btn.dataset.id);
      btn.classList.toggle('in-wish', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    if (window.owReveal) window.owReveal(grid);
    if (window.owInitTilt) window.owInitTilt();
    if (window.initStars) window.initStars();
    if (window.owCompareCount) window.owCompareCount();
  }
})();
