/* ============================================================
   THE OCEAN WATCHES — Main Interactions
   Loader · Nav · Scroll Reveal · Counters · Cursor · Mouse Glow
   Parallax · Tilt · Cart/Wishlist · Quick View · Forms · Toasts
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Shared state ---------- */
  let cart = JSON.parse(localStorage.getItem('ow_cart') || '[]');
  const wishlist = new Set(JSON.parse(localStorage.getItem('ow_wishlist') || '[]'));
  let compare = JSON.parse(localStorage.getItem('ow_compare') || '[]');
  let products = [];
  let authToken = localStorage.getItem('ow_token') || '';
  const fmtPrice = n => 'Rs ' + n.toLocaleString('en-US');

  /* ---------- Collection filter ---------- */
  const chips = $$('.chip[data-filter]');
  const gridCards = $$('.product-card[data-category]');
  const countEl = $('.result-count');
  if (chips.length) {
    const applyFilter = (cat) => {
      let shown = 0;
      gridCards.forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.style.display = show ? '' : 'none';
        if (show) shown++;
        /* retrigger reveal on shown cards */
        if (show && !card.classList.contains('in')) card.classList.add('in');
      });
      chips.forEach(c => c.classList.toggle('active', c.dataset.filter === cat));
      if (countEl) countEl.textContent = 'Showing ' + shown + ' of ' + gridCards.length + ' masterpieces';
    };
    chips.forEach(c => c.addEventListener('click', () => applyFilter(c.dataset.filter)));
    if (countEl) countEl.textContent = 'Showing ' + gridCards.length + ' of ' + gridCards.length + ' masterpieces';
  }

  /* ---------- Hero particles ---------- */
  const particlesBox = $('#particles');
  if (particlesBox && !prefersReduced) {
    const COUNT = window.innerWidth < 640 ? 18 : 34;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const s = document.createElement('span');
      const size = (Math.random() * 4 + 2).toFixed(1);
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDuration = (Math.random() * 16 + 10).toFixed(1) + 's';
      s.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
      s.style.setProperty('--drift', (Math.random() * 80 - 40).toFixed(1) + 'px');
      frag.appendChild(s);
    }
    particlesBox.appendChild(frag);
  }

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(message, icon = 'gift') {
    if (!toastEl) return;
    const icons = {
      gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 7v14M12 7a3 3 0 1 0-3-3c0 3 3 3 3 3zm0 0a3 3 0 1 1 3-3c0 3-3 3-3 3z"/></svg>',
      heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>',
      wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 17c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 7c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>',
      scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M8 21h8"/><path d="M4 7h16"/><path d="m4 7-3 6.5a3.5 3.5 0 0 0 6 0L4 7zm16 0-3 6.5a3.5 3.5 0 0 0 6 0L20 7z"/></svg>'
    };
    toastEl.innerHTML = (icons[icon] || icons.gift) + '<span>' + message + '</span>';
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }
  window.owToast = toast;

  /* ---------- Page loader ---------- */
  const loader = $('.page-loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.add('loaded');
      }, prefersReduced ? 0 : 350);
    });
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.add('loaded');
    }, 3200);
  }

  /* ---------- Watch slow spin (JS-driven, reliable in every browser) ---------- */
  $$('.spin-wrap').forEach((wrap) => {
    let spinAngle = 0;
    let spinLast = performance.now();
    const spinRate = parseFloat(wrap.dataset.spin || '15'); // deg per second → 360° in 24s
    (function spinLoop(now) {
      spinAngle = (spinAngle + (now - spinLast) * spinRate / 1000) % 360;
      spinLast = now;
      wrap.style.transform = 'rotate(' + spinAngle.toFixed(2) + 'deg)';
      requestAnimationFrame(spinLoop);
    })(performance.now());
  });

  /* ---------- Sticky nav + back-to-top ---------- */
  const nav = $('.nav');
  const toTop = $('.to-top');
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (toTop) toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const mobileMenu = $('.mobile-menu');
  if (burger && mobileMenu) {
    const links = $$('a', mobileMenu);
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = burger.classList.contains('open') ? 'hidden' : '';
    });
    links.forEach(l => l.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = $$('.reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-fade');
  window.owReveal = function (scope) {
    const els = (scope && scope.querySelectorAll ? $$('.reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-fade', scope) : revealEls);
    if ('IntersectionObserver' in window && !prefersReduced) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
      els.forEach(el => io.observe(el));
    } else {
      els.forEach(el => el.classList.add('in'));
    }
  };
  window.owReveal();

  /* ---------- Animated counters ---------- */
  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 2200;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const val = Math.round(target * eased).toLocaleString('en-US');
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !prefersReduced && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          runCounter(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  } else {
    counters.forEach(el => el.textContent = (el.dataset.prefix || '') + parseFloat(el.dataset.count).toLocaleString('en-US') + (el.dataset.suffix || ''));
  }

  /* ---------- Mouse glow ---------- */
  const glow = $('#mouse-glow');
  if (glow && !prefersReduced && window.matchMedia('(hover: hover)').matches) {
    let rx = 0, ry = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
      rx = e.clientX; ry = e.clientY;
      glow.style.setProperty('--mx', rx + 'px');
      glow.style.setProperty('--my', ry + 'px');
    }, { passive: true });
  }

  /* ---------- Custom cursor ---------- */
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (dot && ring && !prefersReduced && window.matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, dx = 0, dy = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });
    (function loop() {
      dx += (mx - dx) * 0.16;
      dy += (my - dy) * 0.16;
      ring.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    const hoverTargets = $$('a, button, .tilt, .product-card, input, textarea, select, .hover-target');
    hoverTargets.forEach(t => {
      t.addEventListener('mouseenter', () => ring.classList.add('hover'));
      t.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  /* ---------- Parallax ---------- */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !prefersReduced) {
    const p = 0.1;
    function onParallaxScroll() {
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax || '0.2');
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom > 0 && rect.top < vh) {
          const offset = (vh / 2 - (rect.top + rect.height / 2)) * speed;
          el.style.transform = `translate3d(0, ${offset * p}px, 0)`;
        }
      });
    }
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    onParallaxScroll();
  }

  /* ---------- 3D tilt cards ---------- */
  const tiltBound = new WeakSet();
  function initTilt() {
    if (prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
    $$('.tilt').forEach(card => {
      if (tiltBound.has(card)) return;
      tiltBound.add(card);
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  initTilt();
  window.owInitTilt = initTilt;

  /* ---------- Products data ---------- */
  const PRODUCTS = window.OW_PRODUCTS || [];
  if (PRODUCTS.length) {
    products = PRODUCTS;
    updateCounts();
    bindProductActions();
  }

  /* delegated wishlist / add-to-cart (works for injected cards too) */
  document.addEventListener('click', (e) => {
    const wishBtn = e.target.closest('.wish-btn[data-id]');
    if (wishBtn && products.length) {
      const id = wishBtn.dataset.id;
      if (wishlist.has(id)) {
        wishlist.delete(id);
        toast('Removed from your wishlist', 'heart');
      } else {
        wishlist.add(id);
        toast('Added to your wishlist', 'heart');
      }
      setFavIcon(wishBtn, wishlist.has(id));
      persist();
      updateCounts();
      return;
    }
    const addBtn = e.target.closest('.add-btn[data-id]');
    if (addBtn && products.length) {
      const id = addBtn.dataset.id;
      cart.push(id);
      persist();
      updateCounts();
      const p = products.find(x => x.id === id);
      toast((p ? p.name + ' ' : '') + 'added to cart', 'check');
    }
  });

  /* delegated quick-view clicks */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-quick]');
    if (trigger && window.openQuickView) window.openQuickView(trigger.dataset.quick);
  });

  /* delegated buy-now clicks */
  document.addEventListener('click', (e) => {
    const buy = e.target.closest('[data-buy]');
    if (!buy || !window.openCheckout) return;
    const p = products.find(x => x.id === buy.dataset.buy);
    if (!p) return;
    window.openCheckout([{ id: buy.dataset.buy, qty: 1 }], 'buy');
  });

  function updateCounts() {
    $$('.count-cart').forEach(el => {
      el.textContent = cart.length;
      el.style.display = cart.length ? 'grid' : 'none';
    });
    $$('.count-wish').forEach(el => {
      el.textContent = wishlist.size;
      el.style.display = wishlist.size ? 'grid' : 'none';
    });
  }

  function persist() {
    localStorage.setItem('ow_cart', JSON.stringify([...cart]));
    localStorage.setItem('ow_wishlist', JSON.stringify([...wishlist]));
  }

  function setFavIcon(btn, state) {
    btn.classList.toggle('in-wish', state);
    btn.setAttribute('aria-pressed', String(state));
  }

  function bindProductActions() {
    /* click handling is delegated at document level; here only sync icon states */
    $$('.wish-btn').forEach(btn => setFavIcon(btn, wishlist.has(btn.dataset.id)));
  }

  /* ---------- Quick view modal ---------- */
  const modal = $('#quickview');
  if (modal) {
    const closeBtn = $('#qv-close');
    const qvImg = $('#qv-img');
    const qvName = $('#qv-name');
    const qvPrice = $('#qv-price');
    const qvDesc = $('#qv-desc');
    const qvSpecs = $('#qv-specs');
    const qvStars = $('#qv-stars');
    const qvRatings = $('#qv-ratings');

    window.openQuickView = function (id) {
      const p = products.find(x => x.id === id);
      if (!p) return;
      qvImg.src = p.img;
      qvImg.alt = p.name;
      qvImg.hidden = false;
      qvName.textContent = p.name;
      qvDesc.textContent = p.desc;
      const discount = Math.round((1 - p.discount / p.original) * 100);
      qvPrice.innerHTML =
        '<strong>' + p.discount.toLocaleString('en-US') + ' PKR</strong>' +
        '<s>' + p.original.toLocaleString('en-US') + ' PKR</s>' +
        '<span class="qv-off">-' + discount + '% OFF</span>';
      qvStars.innerHTML = starsHTML(p.rating);
      qvRatings.textContent = '(' + p.reviews + ' reviews)';
      qvSpecs.innerHTML = (p.specs || []).map(s =>
        '<div class="qv-spec"><span>' + s.label + '</span><strong>' + s.value + '</strong></div>'
      ).join('');

      const wishBtn = $('#qv-wish');
      const addBtn = $('#qv-add');
      const buyBtn = $('#qv-buy');

      wishBtn.dataset.id = id;
      setFavIcon(wishBtn, wishlist.has(id));
      wishBtn.onclick = () => {
        if (wishlist.has(id)) { wishlist.delete(id); toast('Removed from wishlist', 'heart'); }
        else { wishlist.add(id); toast('Added to wishlist', 'heart'); }
        setFavIcon(wishBtn, wishlist.has(id));
        persist(); updateCounts();
      };
      addBtn.onclick = () => {
        cart.push(id); persist(); updateCounts();
        toast(p.name + ' added to cart', 'check');
      };
      buyBtn.onclick = () => {
        closeModal();
        openCheckout([{ id, qty: 1 }], 'buy');
      };

      const cmpBtn = $('.qv-actions .cmp-btn');
      if (cmpBtn) {
        cmpBtn.dataset.id = id;
        const on = compare.indexOf(id) > -1;
        cmpBtn.classList.toggle('in-cmp', on);
        cmpBtn.textContent = on ? 'In Compare' : 'Compare';
        cmpBtn.onclick = () => toggleCompare(id, cmpBtn);
      }
      const so = $('#searchOverlay');
      if (so && so.classList.contains('open')) so.classList.remove('open');

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      trapFocus(modal);
    };

    const closeModal = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    };
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  function starsHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= Math.round(rating)
        ? '<svg viewBox="0 0 24 24" fill="currentColor" class="star full"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="star"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
    }
    return html;
  }
  window.starsHTML = starsHTML;

  /* ============================================================
     CART DRAWER + CHECKOUT
     ============================================================ */
  const fmtRs = n => 'Rs ' + n.toLocaleString('en-US');

  /* ---------- Resolve cart ids (+duplicates = qty) into line items ---------- */
  function cartLineItems() {
    const map = new Map();
    cart.forEach(id => map.set(id, (map.get(id) || 0) + 1));
    return [...map.entries()].map(([id, qty]) => {
      const p = products.find(x => x.id === id);
      return p ? { p, id, qty } : null;
    }).filter(Boolean);
  }

  /* ---------- Cart drawer ---------- */
  const drawer = $('#cartDrawer');
  const drawerOverlay = $('#cartOverlay');
  if (drawer) {
    const drawerItems = $('#cartItems');
    const drawerEmpty = $('#cartEmpty');
    const drawerFoot = $('#cartFoot');
    const drawerCount = $('#drawerCount');
    const drawerSub = $('#drawerSub');

    function renderDrawer() {
      const items = cartLineItems();
      if (drawerCount) drawerCount.textContent = String(items.reduce((s, it) => s + it.qty, 0));
      if (!items.length) {
        if (drawerItems) drawerItems.innerHTML = '';
        if (drawerEmpty) drawerEmpty.style.display = '';
        if (drawerFoot) drawerFoot.hidden = true;
        return;
      }
      if (drawerEmpty) drawerEmpty.style.display = 'none';
      if (drawerFoot) drawerFoot.hidden = false;
      if (drawerItems) drawerItems.innerHTML = items.map(it =>
        '<div class="drawer-item" data-id="' + it.id + '">' +
          '<img src="' + it.p.img + '" alt="' + it.p.name + '">' +
          '<div class="drawer-item-info">' +
            '<strong>' + it.p.name + '</strong>' +
            '<span>' + fmtRs(it.p.discount) + '</span>' +
            '<div class="qty-row">' +
              '<button class="qty-btn" data-q="-1" aria-label="Decrease quantity">\u2212</button>' +
              '<span class="qty-val">' + it.qty + '</span>' +
              '<button class="qty-btn" data-q="1" aria-label="Increase quantity">+</button>' +
            '</div>' +
          '</div>' +
          '<button class="drawer-remove" data-rm="' + it.id + '" aria-label="Remove ' + it.p.name + '">\u00d7</button>' +
        '</div>'
      ).join('');
      if (drawerSub) drawerSub.textContent = fmtRs(items.reduce((s, it) => s + it.p.discount * it.qty, 0));
    }

    window.owOpenCart = function () {
      renderDrawer();
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      if (drawerOverlay) drawerOverlay.hidden = false;
      document.body.style.overflow = 'hidden';
      trapFocus(drawer);
    };
    window.owRefreshCart = renderDrawer;
    const closeCart = () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      if (drawerOverlay) drawerOverlay.hidden = true;
      document.body.style.overflow = '';
    };
    const cartClose = $('#cartClose');
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeCart);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart();
    });

    /* qty / remove (delegated) */
    drawer.addEventListener('click', e => {
      const q = e.target.closest('[data-q]');
      if (q) {
        const row = q.closest('.drawer-item');
        const id = row ? row.dataset.id : '';
        const delta = parseInt(q.dataset.q, 10);
        if (delta > 0) {
          cart.push(id);
        } else {
          const idx = cart.indexOf(id);
          if (idx !== -1) cart.splice(idx, 1);
        }
        persist(); updateCounts(); renderDrawer();
        return;
      }
      const rm = e.target.closest('[data-rm]');
      if (rm) {
        const id = rm.dataset.rm;
        cart = cart.filter(x => x !== id);
        persist(); updateCounts(); renderDrawer();
      }
    });

    const cartCheckout = $('#cartCheckout');
    if (cartCheckout) cartCheckout.addEventListener('click', () => {
      const items = cartLineItems();
      if (!items.length) return;
      closeCart();
      window.openCheckout(items, 'cart');
    });
  }

  /* ---------- Checkout modal ---------- */
  const coModal = $('#checkout');
  if (coModal) {
    let coState = null;
    let coPayment = 'card';
    const coSub = $('#coSub');
    const coSave = $('#coSave');
    const coTotal = $('#coTotal');
    const coItems = $('#coItems');
    const coDots = $$('.co-step-dot', coModal);
    const coSteps = $$('.co-step', coModal);
    const coPayBtn = $('#coPay');
    const coHead = $('#coHead');

    /* card preview refs */
    const cpNum = $('#cpNum');
    const cpName = $('#cpName');
    const cpExp = $('#cpExp');
    const cpBrand = $('#cpBrand');

    function coStepShow(n) {
      coSteps.forEach(el => { el.hidden = parseInt(el.dataset.step, 10) !== n; });
      coDots.forEach(d => d.classList.toggle('active', parseInt(d.dataset.pos, 10) <= Math.min(n, 3)));
      if (coHead) coHead.style.display = n === 5 ? 'none' : '';
      coModal.querySelector('.checkout-panel').scrollTop = 0;
    }

    function coTotals(items) {
      const sub = items.reduce((s, it) => s + it.p.discount * it.qty, 0);
      const orig = items.reduce((s, it) => s + it.p.original * it.qty, 0);
      return { sub, save: orig - sub, total: sub };
    }

    function setErr(input, msg) {
      const label = input.closest('label');
      const span = label ? label.querySelector('.co-error') : null;
      if (label) label.classList.toggle('err', !!msg);
      if (span) span.textContent = msg || '';
      return !msg;
    }

    function resetCoForm() {
      ['coName', 'coPhone', 'coEmail', 'coAddr', 'coCity'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; setErr(el, ''); }
      });
      ['coCardName', 'coCardNum', 'coCardExp', 'coCardCvv'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; setErr(el, ''); }
      });
      if (cpNum) cpNum.textContent = '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
      if (cpName) cpName.textContent = 'YOUR NAME';
      if (cpExp) cpExp.textContent = 'MM/YY';
      if (cpBrand) cpBrand.textContent = 'CARD';
      coPayment = 'card';
      setCoPayment('card');
    }

    function setCoPayment(method) {
      coPayment = method;
      $$('.co-pay', coModal).forEach(b => {
        const on = b.dataset.pay === method;
        b.classList.toggle('active', on);
        b.setAttribute('aria-checked', String(on));
      });
      const cardForm = $('#coCardForm');
      const codNote = $('#coCodNote');
      if (cardForm) cardForm.style.display = method === 'card' ? '' : 'none';
      if (codNote) codNote.hidden = method !== 'cod';
    }

    window.openCheckout = function (items, mode) {
      const resolved = items.map(it => {
        const p = products.find(x => x.id === it.id);
        return p ? { p, id: it.id, qty: it.qty || 1 } : null;
      }).filter(Boolean);
      if (!resolved.length) return;
      coState = { items: resolved, mode };
      const t = coTotals(resolved);
      if (coItems) coItems.innerHTML = resolved.map(it =>
        '<div class="co-item">' +
          '<img src="' + it.p.img + '" alt="' + it.p.name + '">' +
          '<div class="co-item-info"><strong>' + it.p.name + '</strong>' +
          '<small>Qty ' + it.qty + '</small></div>' +
          '<span class="co-item-price">' + fmtRs(it.p.discount * it.qty) + '</span>' +
        '</div>'
      ).join('');
      if (coSub) coSub.textContent = fmtRs(t.sub);
      if (coSave) coSave.textContent = '\u2013' + fmtRs(t.save);
      if (coTotal) coTotal.textContent = fmtRs(t.total);
      resetCoForm();
      coStepShow(1);
      coModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      trapFocus(coModal);
    };

    const closeCo = () => {
      coModal.classList.remove('open');
      document.body.style.overflow = '';
      coState = null;
    };
    const coClose = $('#coClose');
    if (coClose) coClose.addEventListener('click', closeCo);
    coModal.addEventListener('click', e => { if (e.target === coModal) closeCo(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && coModal.classList.contains('open')) closeCo();
    });

    /* step 1 -> 2 */
    const coToDetails = $('#coToDetails');
    if (coToDetails) coToDetails.addEventListener('click', () => coStepShow(2));

    /* step 2 -> 1 */
    const coBack1 = $('#coBack1');
    if (coBack1) coBack1.addEventListener('click', () => coStepShow(1));

    /* step 2 validation -> 3 */
    const coToPay = $('#coToPay');
    if (coToPay) coToPay.addEventListener('click', () => {
      const fields = ['coName', 'coPhone', 'coEmail', 'coAddr', 'coCity'];
      const validators = {
        coName: v => v.trim().length >= 3,
        coPhone: v => /^0?\d{10,11}$/.test(v.replace(/[\s-]/g, '')),
        coEmail: v => /^\S+@\S+\.\S+$/.test(v),
        coAddr: v => v.trim().length >= 8,
        coCity: v => v.trim().length >= 2
      };
      const messages = {
        coName: 'Please enter your full name.',
        coPhone: 'Enter a valid phone number (e.g. 0323-2930657).',
        coEmail: 'Enter a valid email address.',
        coAddr: 'Please enter your full delivery address.',
        coCity: 'Please enter your city.'
      };
      let ok = true;
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const good = validators[id](el.value);
        if (!good) ok = false;
        setErr(el, good ? '' : messages[id]);
      });
      if (ok) coStepShow(3);
    });

    /* payment method toggle */
    $$('.co-pay', coModal).forEach(b => b.addEventListener('click', () => setCoPayment(b.dataset.pay)));

    /* ---------- Card helpers ---------- */
    function digits(v) { return (v || '').replace(/\D/g, ''); }
    function formatCardNum(v) {
      const d = digits(v).slice(0, 19);
      const amex = /^3[47]/.test(d);
      const groups = amex ? [4, 6, 5] : [4, 4, 4, 4, 3];
      let out = '', i = 0;
      for (let g = 0; g < groups.length && i < d.length; g++) {
        out += (out ? ' ' : '') + d.slice(i, i + groups[g]);
        i += groups[g];
      }
      return out;
    }
    function formatExp(v) {
      const d = digits(v).slice(0, 4);
      return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    }
    function luhn(n) {
      const d = digits(n);
      if (d.length < 13) return false;
      let sum = 0, alt = false;
      for (let i = d.length - 1; i >= 0; i--) {
        let v = +d[i];
        if (alt) { v *= 2; if (v > 9) v -= 9; }
        sum += v; alt = !alt;
      }
      return sum % 10 === 0;
    }
    function cardBrand(n) {
      const d = digits(n);
      if (/^4/.test(d)) return 'VISA';
      if (/^(5[1-5]|2[2-7])/.test(d)) return 'MASTERCARD';
      if (/^3[47]/.test(d)) return 'AMEX';
      return '';
    }
    function expiryOk(v) {
      const m = v.match(/^(\d{2})\/(\d{2})$/);
      if (!m) return false;
      const mo = +m[1], yr = 2000 + +m[2];
      if (mo < 1 || mo > 12) return false;
      const now = new Date();
      return yr > now.getFullYear() || (yr === now.getFullYear() && mo >= now.getMonth() + 1);
    }

    const coCardNum = $('#coCardNum');
    const coCardExp = $('#coCardExp');
    const coCardCvv = $('#coCardCvv');
    const coCardName = $('#coCardName');
    if (coCardNum) coCardNum.addEventListener('input', () => {
      const v = formatCardNum(coCardNum.value);
      coCardNum.value = v;
      if (cpNum) cpNum.textContent = v || '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
      if (cpBrand) cpBrand.textContent = cardBrand(v) || 'CARD';
      setErr(coCardNum, '');
    });
    if (coCardExp) coCardExp.addEventListener('input', () => {
      coCardExp.value = formatExp(coCardExp.value);
      if (cpExp) cpExp.textContent = coCardExp.value || 'MM/YY';
      setErr(coCardExp, '');
    });
    if (coCardCvv) coCardCvv.addEventListener('input', () => {
      coCardCvv.value = digits(coCardCvv.value).slice(0, 4);
      setErr(coCardCvv, '');
    });
    if (coCardName) coCardName.addEventListener('input', () => {
      if (cpName) cpName.textContent = coCardName.value.toUpperCase() || 'YOUR NAME';
      setErr(coCardName, '');
    });

    /* ---------- Pay ---------- */
    if (coPayBtn) coPayBtn.addEventListener('click', () => {
      const total = coState ? coTotals(coState.items).total : 0;
      if (coPayment === 'card') {
        const num = coCardNum ? coCardNum.value : '';
        const exp = coCardExp ? coCardExp.value : '';
        const cvv = coCardCvv ? coCardCvv.value : '';
        const nm = coCardName ? coCardName.value : '';
        let ok = true;
        if (!luhn(num)) { ok = false; if (coCardNum) setErr(coCardNum, 'Enter a valid card number.'); }
        if (!expiryOk(exp)) { ok = false; if (coCardExp) setErr(coCardExp, 'Enter a valid future expiry (MM/YY).'); }
        if (digits(cvv).length !== 3) { ok = false; if (coCardCvv) setErr(coCardCvv, '3-digit CVV.'); }
        if (nm.trim().length < 3) { ok = false; if (coCardName) setErr(coCardName, 'Enter the name on the card.'); }
        if (!ok) return;
      }

      coStepShow(4);
      const finishOrder = (order) => {
        if (!coModal.classList.contains('open')) return;
        try {
          const orders = JSON.parse(localStorage.getItem('ow_orders') || '[]');
          orders.unshift(order);
          localStorage.setItem('ow_orders', JSON.stringify(orders));
        } catch (err) { /* storage unavailable */ }

        if (coState.mode === 'cart') {
          cart = [];
          persist();
          updateCounts();
          if (window.owRefreshCart) window.owRefreshCart();
        }

        const oid = $('#coOrderId');
        if (oid) oid.textContent = order.id;
        const note = $('#coSuccessNote');
        if (note) {
          note.textContent = coPayment === 'cod'
            ? 'Thank you ' + (order.customer ? order.customer.name.split(' ')[0] : '') + '! Keep ' + fmtRs(order.total) + ' ready in cash — your Ocean is on its way.'
            : 'Order ' + order.id + ' confirmed for ' + fmtRs(order.total) + '. Complete the payment in the new tab to ship your timepiece.';
        }
        const box = $('#coSuccessBox');
        if (box) {
          box.innerHTML =
            '<div><span>Items</span><strong>' + order.items.length + ' timepiece' + (order.items.length > 1 ? 's' : '') + '</strong></div>' +
            '<div><span>Total Paid</span><strong>' + fmtRs(order.total) + '</strong></div>' +
            '<div><span>Payment</span><strong>' + (coPayment === 'cod' ? 'Cash on Delivery' : 'Online') + '</strong></div>' +
            '<div><span>Delivery</span><strong class="free">Free &middot; Insured</strong></div>';
        }
        coStepShow(5);
      };
      const fallbackDemo = () => {
        const order = {
          id: 'OW-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6),
          date: new Date().toISOString(),
          items: coState.items.map(it => ({ id: it.id, name: it.p.name, qty: it.qty, price: it.p.discount })),
          totals: coTotals(coState.items),
          total: coTotals(coState.items).total,
          customer: { name: ($('#coName') || {}).value || '' },
          payment: coPayment === 'cod' ? 'cod' : 'card',
          status: 'confirmed'
        };
        finishOrder(order);
      };

      const customer = {
        name: ($('#coName') || {}).value || '',
        phone: ($('#coPhone') || {}).value || '',
        email: ($('#coEmail') || {}).value || '',
        address: ($('#coAddr') || {}).value || '',
        city: ($('#coCity') || {}).value || ''
      };
      const payload = {
        items: coState.items.map(it => ({ id: it.id, qty: it.qty })),
        customer,
        payment_method: coPayment === 'cod' ? 'cod' : 'card'
      };

      apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) }, authToken)
        .then(async (d) => {
          const order = d.order;
          order.customer = customer;
          order.items = order.items.map(it => ({ ...it, name: it.name }));
          if (coPayment !== 'cod' && order.payment_status === 'unpaid') {
            try {
              const pay = await apiFetch('/payments/checkout', { method: 'POST', body: JSON.stringify({ orderId: order.id, gateway: 'sandbox' }) });
              if (pay.url) window.open(pay.url, '_blank');
            } catch (err) { /* payment link still emailed */ }
          }
          finishOrder(order);
        })
        .catch(() => fallbackDemo());
    });
  }

  /* ---------- Newsletter forms ---------- */
  $$('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      const note = form.querySelector('.form-note') || (() => {
        const n = document.createElement('p');
        n.className = 'form-note';
        form.appendChild(n);
        return n;
      })();
      if (!input.value || !/^\S+@\S+\.\S+$/.test(input.value)) {
        note.textContent = 'Please enter a valid email address.';
        note.classList.remove('ok');
        return;
      }
      note.textContent = 'Welcome to the inner circle. Our latest arrivals are on their way to your inbox.';
      note.classList.add('ok');
      input.value = '';
      toast('Subscribed to The Ocean Watches', 'wave');
    });
  });

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    if (item.classList.contains('open')) q.setAttribute('aria-expanded', 'true');
    q.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.faq-item').forEach(i => {
        const h = i.querySelector('.faq-q');
        i.classList.remove('open');
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Scroll progress indicator ---------- */
  const progressEl = $('#scrollProgress');
  if (progressEl) {
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progressEl.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---------- Cursor spotlight (global) ---------- */
  const spot = $('#cursor-spot');
  if (spot) {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches || prefersReduced) {
      spot.remove();
    } else {
      let sx = -320, sy = -320, tx = -320, ty = -320;
      document.addEventListener('mousemove', e => {
        tx = e.clientX; ty = e.clientY;
        spot.style.opacity = '1';
      }, { passive: true });
      (function spotFrame() {
        sx += (tx - sx) * 0.12;
        sy += (ty - sy) * 0.12;
        spot.style.transform = 'translate3d(' + (sx - 260) + 'px,' + (sy - 260) + 'px,0)';
        requestAnimationFrame(spotFrame);
      })();
    }
  }

  /* ---------- Magnetic buttons ---------- */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !prefersReduced) {
    $$('.btn').forEach(b => b.classList.add('magnetic'));
    document.addEventListener('mouseover', e => {
      const b = e.target.closest('.btn.magnetic');
      if (!b || b._mag) return;
      b._mag = true;
      b.addEventListener('mousemove', ev => {
        const r = b.getBoundingClientRect();
        const dx = ev.clientX - (r.left + r.width / 2);
        const dy = ev.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + (dx * 0.26).toFixed(1) + 'px,' + (dy * 0.26).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- Ripple click effect ---------- */
  document.addEventListener('click', e => {
    const target = e.target.closest('.btn, .icon-btn, .act-btn, .co-pay, .chip');
    if (!target || prefersReduced) return;
    const rect = target.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = d + 'px';
    span.style.left = (e.clientX - rect.left - d / 2) + 'px';
    span.style.top = (e.clientY - rect.top - d / 2) + 'px';
    target.appendChild(span);
    setTimeout(() => span.remove(), 750);
  });

  /* ---------- Luxury sound toggle (WebAudio ticks, no assets) ---------- */
  let soundOn = localStorage.getItem('ow_sound') === '1';
  let audioCtx = null;
  function ensureCtx() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    return audioCtx;
  }
  function tick(freq) {
    if (!soundOn) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq || 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.18);
  }
  function syncSoundUI() {
    const btn = document.querySelector('[data-sound]');
    if (!btn) return;
    btn.classList.toggle('on', soundOn);
    btn.setAttribute('aria-label', soundOn ? 'Sound effects: on' : 'Sound effects: off');
    btn.setAttribute('aria-pressed', String(soundOn));
  }
  window.owToggleSound = function () {
    soundOn = !soundOn;
    localStorage.setItem('ow_sound', soundOn ? '1' : '0');
    syncSoundUI();
    if (soundOn) tick(1320);
    else toast('Sound effects muted', 'wave');
  };
  if (!prefersReduced) {
    document.addEventListener('click', e => {
      if (e.target.closest('a, button, .chip')) tick(980);
    });
  }
  syncSoundUI();

  /* ---------- Compare watches ---------- */
  const MAX_CMP = 3;
  const scaleIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v18M8 21h8"/><path d="M4 7h16"/><path d="m4 7-3 6.5a3.5 3.5 0 0 0 6 0L4 7zm16 0-3 6.5a3.5 3.5 0 0 0 6 0L20 7z"/></svg>';
  const compareDrawer = $('#compareDrawer');
  const compareOverlay = $('#compareOverlay');
  const compareSlots = $('#compareSlots');
  const compareCount = $('#compareCount');
  const compareClose = $('#compareClose');
  const compareGo = $('#compareGo');
  const comparePill = $('.count-compare');
  const compareModal = $('#compareModal');
  const compareTable = $('#compareTable');

  function byId(id) { return products.find(p => p.id === id); }

  function renderCompare() {
    if (compareCount) compareCount.textContent = compare.length + '/3';
    if (comparePill) {
      comparePill.textContent = compare.length;
      comparePill.style.display = compare.length ? '' : 'none';
    }
    $$('.cmp-btn, .sr-cmp').forEach(b => {
      const id = b.dataset.id || b.dataset.compare;
      const on = compare.indexOf(id) > -1;
      b.classList.toggle('in-cmp', on);
      if (b.classList.contains('sr-cmp') || b.classList.contains('cmp-text')) b.textContent = on ? 'In Compare' : 'Compare';
    });
    if (!compareSlots) return;
    compareSlots.innerHTML = compare.map(id => {
      const p = byId(id);
      if (!p) return '';
      return '<div class="compare-slot">' +
        '<button class="cmp-remove" data-cmp="' + id + '" aria-label="Remove ' + p.name + '" type="button">&times;</button>' +
        '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" width="96" height="120">' +
        '<strong>' + p.name + '</strong>' +
        '<span>' + fmtPrice(p.discount) + '</span>' +
      '</div>';
    }).join('') +
      '<div class="compare-slot compare-slot-add' + (compare.length >= MAX_CMP ? ' hidden' : '') + '">' +
        '<a href="collection.html"><span>+</span><small>Add another watch</small></a>' +
      '</div>';
    if (compareGo) compareGo.disabled = compare.length < 2;
  }
  function persistCompare() {
    localStorage.setItem('ow_compare', JSON.stringify(compare));
    renderCompare();
  }
  window.owOpenCompare = function () {
    if (!compareDrawer) return;
    renderCompare();
    compareDrawer.classList.add('open');
    compareOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  function closeCompare() {
    compareDrawer.classList.remove('open');
    compareOverlay.hidden = true;
    document.body.style.overflow = '';
  }
  function toggleCompare(id, btn) {
    const p = byId(id);
    const idx = compare.indexOf(id);
    if (idx > -1) {
      compare.splice(idx, 1);
      toast((p ? p.name + ' ' : '') + 'removed from compare', 'scale');
    } else {
      if (compare.length >= MAX_CMP) {
        toast('Compare holds up to three timepieces', 'wave');
        return;
      }
      compare.push(id);
      toast((p ? p.name + ' ' : '') + 'added to compare', 'check');
    }
    persistCompare();
    if (btn) renderCompare();
  }
  window.owCompareCount = renderCompare;

  document.addEventListener('click', e => {
    const btn = e.target.closest('.cmp-btn, .sr-cmp');
    if (btn) {
      const id = btn.dataset.id || btn.dataset.compare;
      if (id) toggleCompare(id, btn);
      return;
    }
    const rm = e.target.closest('.cmp-remove');
    if (rm) { toggleCompare(rm.dataset.cmp); return; }
  });
  if (compareClose) compareClose.addEventListener('click', closeCompare);
  if (compareOverlay) compareOverlay.addEventListener('click', closeCompare);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && compareDrawer && compareDrawer.classList.contains('open')) closeCompare();
  });

  function openComparison() {
    const list = compare.map(byId).filter(Boolean);
    if (list.length < 2 || !compareTable) return;
    closeCompare();
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    let html = '<thead><tr><th class="cmp-blank"></th>' + list.map(p =>
      '<th><img src="' + p.img + '" alt="' + p.name + '" width="56" height="70"><strong>' + esc(p.name) + '</strong><span>' + fmtPrice(p.discount) + '</span></th>'
    ).join('') + '</tr></thead><tbody>';
    const row = (label, fn) => '<tr><td class="cmp-row-label">' + label + '</td>' + list.map(p => '<td>' + fn(p) + '</td>').join('') + '</tr>';
    html += row('Price', p => '<strong class="gold">' + fmtPrice(p.discount) + '</strong><s>' + fmtPrice(p.original) + '</s>');
    html += row('Rating', p => p.rating.toFixed(1) + ' \u2605 (' + p.reviews + ' reviews)');
    html += row('Collection', p => p.category);
    html += row('Badge', p => '<span class="badge badge-' + p.badge.type + '">' + esc(p.badge.label) + '</span>');
    html += row('Description', p => p.desc);
    (list[0].specs || []).forEach(s => {
      html += row(s.label, p => {
        const sp = (p.specs || []).find(x => x.label === s.label);
        return sp ? esc(sp.value) : '&mdash;';
      });
    });
    html += '</tbody>';
    compareTable.innerHTML = html;
    compareModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    trapFocus(compareModal);
  }
  if (compareGo) compareGo.addEventListener('click', openComparison);
  if (compareModal) {
    const closeComparison = () => { compareModal.classList.remove('open'); document.body.style.overflow = ''; };
    const cmc = $('#compareModalClose');
    if (cmc) cmc.addEventListener('click', closeComparison);
    compareModal.addEventListener('click', e => { if (e.target === compareModal) closeComparison(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && compareModal.classList.contains('open')) closeComparison();
    });
  }

  /* ---------- Premium search overlay ---------- */
  const searchOverlay = $('#searchOverlay');
  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');
  const searchEmpty = $('#searchEmpty');
  if (searchOverlay && searchInput) {
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    const searchQuery = q => {
      const needle = q.trim().toLowerCase();
      if (!needle) return products;
      return products.filter(p =>
        (p.name + ' ' + p.category + ' ' + p.desc + ' ' + p.badge.label).toLowerCase().indexOf(needle) > -1
      );
    };
    function renderSearch(q) {
      const list = searchQuery(q);
      searchEmpty.hidden = list.length > 0;
      searchResults.innerHTML = list.map(p =>
        '<div class="search-result" role="listitem">' +
          '<img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy" width="64" height="80">' +
          '<div class="sr-info">' +
            '<strong>' + esc(p.name) + '</strong>' +
            '<span>' + esc(p.category) + ' &middot; ' + fmtPrice(p.discount) + '</span>' +
            '<span class="sr-rating">' + p.rating.toFixed(1) + ' \u2605 (' + p.reviews + ')</span>' +
          '</div>' +
          '<div class="sr-actions">' +
            '<button class="btn btn-ghost btn-sm sr-cmp" data-compare="' + p.id + '" type="button">Compare</button>' +
            '<button class="btn btn-gold btn-sm" data-quick="' + p.id + '" type="button">View</button>' +
          '</div>' +
        '</div>'
      ).join('');
    }
    window.owOpenSearch = function () {
      searchOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      renderSearch('');
      setTimeout(() => searchInput.focus(), 60);
    };
    const closeSearch = () => {
      searchOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };
    const sc = $('#searchClose');
    if (sc) sc.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
    searchInput.addEventListener('input', () => renderSearch(searchInput.value));
    searchResults.addEventListener('click', e => {
      const qv = e.target.closest('[data-quick]');
      if (qv) closeSearch();
    });
    document.addEventListener('keydown', e => {
      const tag = document.activeElement && document.activeElement.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === '/' && !typing) {
        e.preventDefault();
        window.owOpenSearch();
      }
      if (e.key === 'Escape' && searchOverlay.classList.contains('open')) closeSearch();
    });
  }

  /* ---------- Inject compare buttons into product cards + quick view ---------- */
  $$('.product-card').forEach(card => {
    const idBtn = card.querySelector('[data-id]') || card.querySelector('[data-buy]') || card.querySelector('[data-quick]');
    const actions = card.querySelector('.product-actions');
    if (!idBtn || !actions || actions.querySelector('.cmp-btn')) return;
    const b = document.createElement('button');
    b.className = 'act-btn cmp-btn';
    b.dataset.id = idBtn.dataset.id || idBtn.dataset.buy || idBtn.dataset.quick;
    b.setAttribute('aria-label', 'Compare this watch');
    b.innerHTML = scaleIcon;
    actions.appendChild(b);
  });
  const qvActions = $('.qv-actions');
  if (qvActions && !qvActions.querySelector('.cmp-btn')) {
    const b = document.createElement('button');
    b.className = 'btn btn-ghost cmp-btn cmp-text';
    b.dataset.id = '';
    b.textContent = 'Compare';
    qvActions.insertBefore(b, $('#qv-wish'));
  }

  renderCompare();

  /* ---------- Account modal (login / register / order history) ---------- */
  const accountModal = $('#accountModal');
  if (accountModal) {
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    const accForms = $('#accForms');
    const accIn = $('#accIn');
    const accOrdersEl = $('#accOrders');
    authToken = authToken || localStorage.getItem('ow_token') || '';

    $$('.acc-tab', accountModal).forEach(tab => tab.addEventListener('click', () => {
      $$('.acc-tab', accountModal).forEach(t => { t.classList.toggle('active', t === tab); });
      $('#accLogin').hidden = tab.dataset.tab !== 'login';
      $('#accRegister').hidden = tab.dataset.tab !== 'register';
      $('#accLoginErr').textContent = '';
      $('#accRegErr').textContent = '';
    }));

    function renderAccOrders(orders) {
      accOrdersEl.innerHTML = orders.length ? orders.map(o =>
        '<div class="acc-order">' +
          '<div class="acc-order-head"><b>' + esc(o.id) + '</b>' +
            '<span class="pill pill-' + esc(o.status) + '">' + esc(o.status) + '</span>' +
            '<span class="pill pill-' + esc(o.payment_status) + '">' + esc(o.payment_status) + '</span></div>' +
          '<div class="acc-order-body">' +
            '<div class="acc-order-items">' + o.items.map(it =>
              '<span>' + esc(it.name) + ' × ' + it.qty + '</span>').join('') + '</div>' +
            '<strong class="acc-order-total">' + fmtPrice(o.total) + '</strong>' +
          '</div>' +
          '<small class="acc-order-date">' + new Date(o.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) + '</small>' +
        '</div>').join('') : '<p class="acc-empty">No orders yet. Your confirmed orders will appear here.</p>';
    }

    async function showAccount() {
      accForms.hidden = false;
      accIn.hidden = true;
      if (authToken) {
        try {
          const me = await apiFetch('/auth/me', {}, authToken);
          accForms.hidden = true;
          accIn.hidden = false;
          $('#accName').textContent = me.user.name;
          $('#accEmailShow').textContent = me.user.email;
          const hist = await apiFetch('/orders/my', {}, authToken);
          renderAccOrders(hist.orders);
        } catch (err) {
          authToken = '';
          localStorage.removeItem('ow_token');
        }
      }
    }

    window.owOpenAccount = function () {
      showAccount();
      accountModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const accClose = $('#accountClose');
    if (accClose) accClose.addEventListener('click', () => {
      accountModal.classList.remove('open');
      document.body.style.overflow = '';
    });
    accountModal.addEventListener('click', e => { if (e.target === accountModal) {
      accountModal.classList.remove('open');
      document.body.style.overflow = '';
    } });

    $('#accLogin').addEventListener('submit', async e => {
      e.preventDefault();
      const errEl = $('#accLoginErr');
      errEl.textContent = '';
      try {
        const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({
          email: $('#accEmail').value.trim(), password: $('#accPass').value
        }) }, '');
        authToken = res.token;
        localStorage.setItem('ow_token', res.token);
        toast('Welcome back, ' + res.user.name.split(' ')[0], 'check');
        showAccount();
      } catch (err) { errEl.textContent = err.message; }
    });
    $('#accRegister').addEventListener('submit', async e => {
      e.preventDefault();
      const errEl = $('#accRegErr');
      errEl.textContent = '';
      try {
        const res = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({
          name: $('#regName').value.trim(),
          email: $('#regEmail').value.trim(),
          phone: $('#regPhone').value.trim(),
          city: $('#regCity').value.trim(),
          password: $('#regPass').value
        }) }, '');
        authToken = res.token;
        localStorage.setItem('ow_token', res.token);
        toast('Account created — welcome to the circle', 'check');
        showAccount();
      } catch (err) { errEl.textContent = err.message; }
    });
    $('#accLogout').addEventListener('click', () => {
      authToken = '';
      localStorage.removeItem('ow_token');
      toast('Signed out', 'wave');
      showAccount();
    });
  }

  /* ---------- API helpers + live catalogue sync ---------- */
  async function apiFetch(path, opts = {}, token = '') {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch('/api' + path, { ...opts, headers });
    let data = {};
    try { data = await res.json(); } catch (err) { /* empty */ }
    if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
    return data;
  }

  (function syncCatalogue() {
    fetch('/api/products')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || !Array.isArray(d.products) || !d.products.length) return;
        const server = new Map(d.products.map(p => [p.id, p]));
        products = products.map(p => server.get(p.id) || p);
        if (server.size) {
          const merged = products.concat(d.products.filter(p => !products.some(x => x.id === p.id)));
          products = merged;
        }
        renderCompare();
        updateCounts();
        bindProductActions();
      })
      .catch(() => { /* offline fallback to local catalogue */ });
  })();

  /* ---------- Modal focus trap ---------- */
  function trapFocus(container) {
    const focusables = $$('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])', container)
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    container.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    first.focus();
  }
  window.owTrapFocus = trapFocus;
  $$('.modal').forEach(m => { m.addEventListener('keydown', e => { if (e.key === 'Escape') m.classList.contains('open') && m.querySelector('.modal-close') && m.querySelector('.modal-close').click(); }); });

  /* ---------- Reveal for dynamically injected stars ---------- */
  window.initStars = function () { $$('.stars-inline').forEach(el => { el.innerHTML = starsHTML(parseFloat(el.dataset.rating)); }); };
  window.initStars();
})();
