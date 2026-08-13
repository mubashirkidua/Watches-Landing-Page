/* The Ocean Watches — Admin Console */
(() => {
  'use strict';

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const TOKEN_KEY = 'ow_admin_token';

  const fmt = n => 'Rs. ' + Number(n).toLocaleString('en-IN');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const iso = s => { const d = new Date(s); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }); };

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch('/api' + path, { ...opts, headers });
    let data = {};
    try { data = await res.json(); } catch (err) { /* non-json */ }
    if (!res.ok) {
      if (res.status === 401) { logout(); throw new Error('Session expired'); }
      throw new Error(data.error || 'Request failed (' + res.status + ')');
    }
    return data;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    $('#appView').hidden = true;
    $('#loginView').style.display = '';
  }

  /* ---------- Login ---------- */
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const pass = $('#loginPass').value;
    const errEl = $('#loginErr');
    errEl.textContent = '';
    const btn = $('#loginBtn');
    btn.textContent = 'Signing in…';
    btn.disabled = true;
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem(TOKEN_KEY, data.token);
      $('#adminEmail').textContent = data.admin.email;
      boot();
    } catch (err) {
      errEl.textContent = err.message;
    } finally {
      btn.textContent = 'Sign in';
      btn.disabled = false;
    }
  });

  /* ---------- Navigation ---------- */
  const TITLES = { dashboard: 'Dashboard', products: 'Products', orders: 'Orders', customers: 'Customers', coupons: 'Coupons' };
  $$('#nav .nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      $$('#nav .nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      $$('.view').forEach(v => v.hidden = true);
      const view = $('#view-' + item.dataset.view);
      view.hidden = false;
      $('#viewTitle').textContent = TITLES[item.dataset.view];
      loadView(item.dataset.view);
    });
  });
  $('#logoutBtn').addEventListener('click', logout);

  function loadView(name) {
    if (name === 'dashboard') loadDashboard();
    else if (name === 'products') loadProducts();
    else if (name === 'orders') loadOrders();
    else if (name === 'customers') loadCustomers();
    else if (name === 'coupons') loadCoupons();
  }

  /* ---------- Dashboard ---------- */
  async function loadDashboard() {
    try {
      const s = await api('/admin/stats');
      $('#stRevenue').textContent = fmt(s.revenue);
      $('#stUnpaid').textContent = fmt(s.unpaid);
      $('#stOrders').textContent = s.ordersCount;
      $('#stCustomers').textContent = s.customersCount;
      $('#stPending').textContent = s.pendingOrders;
      const mailDot = $('#mailDot');
      mailDot.title = s.mailEnabled ? 'SMTP email enabled' : 'SMTP not configured — emails are logged to console';
      mailDot.classList.toggle('on', !!s.mailEnabled);

      $('#lowStock').innerHTML = s.lowStock.length
        ? s.lowStock.map(p => '<div class="mini-item"><span>' + esc(p.name) + '</span><span class="pill stock-' + (p.stock > 0 ? 'low' : 'low') + '">' + p.stock + ' left</span></div>').join('')
        : '<div class="empty">All products are well stocked.</div>';

      $('#recentOrders').innerHTML = s.recentOrders.length
        ? s.recentOrders.map(o =>
            '<div class="mini-item"><span>' + esc(o.id) + ' · ' + esc(o.name) +
            '<span class="pill ' + o.payment_status + '" style="margin-left:6px">' + o.payment_status + '</span></span>' +
            '<b>' + fmt(o.total) + '</b></div>').join('')
        : '<div class="empty">No orders yet.</div>';

      const totalStatus = s.byStatus.reduce((a, b) => a + b.c, 0) || 1;
      $('#byStatus').innerHTML = s.byStatus.length
        ? s.byStatus.map(x =>
            '<div class="bar-row"><span class="lbl">' + esc(x.status) + '</span>' +
            '<div class="track"><div class="fill" style="width:' + Math.round(x.c / totalStatus * 100) + '%"></div></div>' +
            '<span class="val">' + x.c + '</span></div>').join('')
        : '<div class="empty">No data yet.</div>';

      const maxCat = Math.max(1, ...s.byCategory.map(c => c.sold));
      $('#byCategory').innerHTML = s.byCategory.length
        ? s.byCategory.map(c =>
            '<div class="bar-row"><span class="lbl">' + esc(c.category) + '</span>' +
            '<div class="track"><div class="fill" style="width:' + Math.round(c.sold / maxCat * 100) + '%"></div></div>' +
            '<span class="val">' + c.sold + '</span></div>').join('')
        : '<div class="empty">No sales yet.</div>';
    } catch (err) {
      toast(err.message);
    }
  }

  /* ---------- Products ---------- */
  let allProducts = [];
  async function loadProducts() {
    try {
      const d = await api('/products');
      allProducts = d.products;
      renderProducts();
    } catch (err) { toast(err.message); }
  }
  function renderProducts() {
    const q = ($('#prodSearch').value || '').toLowerCase();
    const rows = allProducts.filter(p => !q || (p.name + p.category + p.id).toLowerCase().includes(q));
    $('#prodTable tbody').innerHTML = rows.map(p =>
      '<tr>' +
        '<td><span class="name-cell"><img src="/' + p.img + '" alt="">' + esc(p.name) + '</span></td>' +
        '<td>' + esc(p.category) + '</td>' +
        '<td class="price">' + fmt(p.discount) + '</td>' +
        '<td>' + p.off + '%</td>' +
        '<td><span class="pill stock-' + (p.stock <= 5 ? 'low' : 'ok') + '">' + p.stock + '</span></td>' +
        '<td>' + (p.featured ? '★' : '') + '</td>' +
        '<td><button class="row-btn" data-edit="' + esc(p.id) + '">Edit</button>' +
            '<button class="row-btn danger" data-del="' + esc(p.id) + '">Delete</button></td>' +
      '</tr>').join('') || '<tr><td colspan="7" class="empty">No products found.</td></tr>';
  }
  $('#prodSearch').addEventListener('input', renderProducts);
  $('#addProductBtn').addEventListener('click', () => openProductModal());
  $('#prodTable tbody').addEventListener('click', async e => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    if (edit) {
      const p = allProducts.find(x => x.id === edit.dataset.edit);
      if (p) openProductModal(p);
    } else if (del) {
      const p = allProducts.find(x => x.id === del.dataset.del);
      if (p && confirm('Delete "' + p.name + '"?')) {
        try {
          await api('/products/products/' + p.id, { method: 'DELETE' });
          toast('Product deleted');
          loadProducts();
        } catch (err) { toast(err.message); }
      }
    }
  });

  function openProductModal(p) {
    const form = $('#prodForm');
    form.reset();
    $('#prodModalTitle').textContent = p ? 'Edit product' : 'New product';
    form.elements.id.disabled = !!p;
    if (p) {
      form.elements.id.value = p.id;
      form.elements.category.value = p.category;
      form.elements.name.value = p.name;
      form.elements.desc.value = p.desc;
      form.elements.original.value = p.original;
      form.elements.discount.value = p.discount;
      form.elements.stock.value = p.stock;
      form.elements.rating.value = p.rating;
      form.elements.img.value = p.img;
      form.elements.badgeLabel.value = p.badge?.label || '';
      form.elements.badgeType.value = p.badge?.type || 'gold';
      form.elements.featured.checked = !!p.featured;
    }
    $('#prodErr').textContent = '';
    $('#productModal').hidden = false;
  }
  $('#prodForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const body = {
      id: form.elements.id.value.trim(),
      category: form.elements.category.value.trim(),
      name: form.elements.name.value.trim(),
      desc: form.elements.desc.value.trim(),
      original: Number(form.elements.original.value),
      discount: Number(form.elements.discount.value),
      stock: Number(form.elements.stock.value),
      rating: Number(form.elements.rating.value || 4.5),
      img: form.elements.img.value.trim(),
      badge: { label: form.elements.badgeLabel.value.trim(), type: form.elements.badgeType.value },
      featured: form.elements.featured.checked
    };
    const editing = !form.elements.id.disabled && allProducts.some(x => x.id === body.id);
    try {
      if (editing) {
        await api('/products/products/' + encodeURIComponent(body.id), { method: 'PUT', body: JSON.stringify(body) });
        toast('Product updated');
      } else {
        await api('/products/products', { method: 'POST', body: JSON.stringify(body) });
        toast('Product created');
      }
      $('#productModal').hidden = true;
      loadProducts();
    } catch (err) { $('#prodErr').textContent = err.message; }
  });

  /* ---------- Orders ---------- */
  async function loadOrders() {
    try {
      const status = $('#orderStatus').value;
      const q = $('#orderSearch').value.trim();
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (q) params.set('q', q);
      const d = await api('/admin/orders?' + params.toString());
      $('#orderTable tbody').innerHTML = d.orders.map(o =>
        '<tr>' +
          '<td><b>' + esc(o.id) + '</b><div class="order-items" hidden>' + o.items.map(it =>
            '<div><span>' + esc(it.name) + ' × ' + it.qty + '</span><span>' + fmt(it.price * it.qty) + '</span></div>').join('') +
            '<div><b>Subtotal</b><b>' + fmt(o.subtotal) + '</b></div>' +
            (o.discount ? '<div><span>Discount</span><span>−' + fmt(o.discount) + '</span></div>' : '') +
            '<div><b>Total</b><b>' + fmt(o.total) + '</b></div></div>' +
            '<button class="row-btn" data-items="' + esc(o.id) + '">Items</button></td>' +
          '<td>' + esc(o.name) + '<br><small>' + esc(o.phone) + '</small></td>' +
          '<td class="price">' + fmt(o.total) + '</td>' +
          '<td><span class="pill ' + esc(o.payment_status) + '">' + o.payment_status + '</span><br><small>' + esc(o.payment_method || '') + '</small></td>' +
          '<td>' + iso(o.created_at) + '</td>' +
          '<td><select class="status-sel" data-order="' + esc(o.id) + '">' +
            ['pending','confirmed','shipped','delivered','cancelled'].map(s =>
              '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + s + '</option>').join('') +
          '</select></td>' +
        '</tr>').join('') || '<tr><td colspan="6" class="empty">No orders found.</td></tr>';
    } catch (err) { toast(err.message); }
  }
  $('#orderStatus').addEventListener('change', loadOrders);
  $('#orderSearch').addEventListener('input', debounce(loadOrders, 300));
  $('#orderTable tbody').addEventListener('click', e => {
    const b = e.target.closest('[data-items]');
    if (b) {
      const box = b.parentElement.querySelector('.order-items');
      if (box) box.hidden = !box.hidden;
    }
  });
  $('#orderTable tbody').addEventListener('change', async e => {
    const sel = e.target.closest('.status-sel');
    if (!sel) return;
    try {
      const d = await api('/admin/orders/' + sel.dataset.order, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value })
      });
      toast('Order ' + sel.dataset.order + ' → ' + d.order.status);
    } catch (err) {
      toast(err.message);
      loadOrders();
    }
  });

  /* ---------- Customers ---------- */
  async function loadCustomers() {
    try {
      const d = await api('/admin/customers');
      $('#custTable tbody').innerHTML = d.customers.map(c =>
        '<tr>' +
          '<td><b>' + esc(c.name) + '</b></td>' +
          '<td>' + esc(c.email) + '</td>' +
          '<td>' + esc(c.phone) + '</td>' +
          '<td>' + esc(c.city) + '</td>' +
          '<td>' + c.order_count + '</td>' +
          '<td class="price">' + fmt(c.spend) + '</td>' +
          '<td>' + iso(c.created_at) + '</td>' +
        '</tr>').join('') || '<tr><td colspan="7" class="empty">No customers yet.</td></tr>';
    } catch (err) { toast(err.message); }
  }

  /* ---------- Coupons ---------- */
  let allCoupons = [];
  async function loadCoupons() {
    try {
      const d = await api('/coupons');
      allCoupons = d.coupons;
      $('#couponTable tbody').innerHTML = d.coupons.map(c =>
        '<tr>' +
          '<td><b>' + esc(c.id) + '</b></td>' +
          '<td>' + esc(c.name) + '</td>' +
          '<td>' + c.type + '</td>' +
          '<td>' + (c.type === 'percent' ? c.value + '%' : fmt(c.value)) + '</td>' +
          '<td>' + fmt(c.min_order) + '</td>' +
          '<td>' + c.used + ' / ' + (c.max_uses || '∞') + '</td>' +
          '<td><span class="pill ' + (c.active ? 'delivered' : 'cancelled') + '">' + (c.active ? 'Active' : 'Off') + '</span></td>' +
          '<td><button class="row-btn" data-edit="' + esc(c.id) + '">Edit</button>' +
              '<button class="row-btn danger" data-del="' + esc(c.id) + '">Delete</button></td>' +
        '</tr>').join('') || '<tr><td colspan="8" class="empty">No coupons yet.</td></tr>';
    } catch (err) { toast(err.message); }
  }
  $('#addCouponBtn').addEventListener('click', () => openCouponModal());
  $('#couponTable tbody').addEventListener('click', async e => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    if (edit) {
      const c = allCoupons.find(x => x.id === edit.dataset.edit);
      if (c) openCouponModal(c);
    } else if (del && confirm('Delete coupon "' + del.dataset.del + '"?')) {
      try {
        await api('/coupons/' + del.dataset.del, { method: 'DELETE' });
        toast('Coupon deleted');
        loadCoupons();
      } catch (err) { toast(err.message); }
    }
  });
  function openCouponModal(c) {
    const form = $('#couponForm');
    form.reset();
    $('#couponModalTitle').textContent = c ? 'Edit coupon' : 'New coupon';
    form.elements.id.disabled = !!c;
    if (c) {
      form.elements.id.value = c.id;
      form.elements.name.value = c.name;
      form.elements.type.value = c.type;
      form.elements.value.value = c.value;
      form.elements.min_order.value = c.min_order;
      form.elements.max_uses.value = c.max_uses || 0;
      form.elements.active.checked = c.active;
    }
    $('#couponErr').textContent = '';
    $('#couponModal').hidden = false;
  }
  $('#couponForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const body = {
      id: form.elements.id.value.trim(),
      name: form.elements.name.value.trim(),
      type: form.elements.type.value,
      value: Number(form.elements.value.value),
      min_order: Number(form.elements.min_order.value || 0),
      max_uses: Number(form.elements.max_uses.value || 0),
      active: form.elements.active.checked
    };
    const editing = !form.elements.id.disabled && allCoupons.some(x => x.id === body.id);
    try {
      if (editing) {
        await api('/coupons/' + body.id, { method: 'PUT', body: JSON.stringify(body) });
        toast('Coupon updated');
      } else {
        await api('/coupons', { method: 'POST', body: JSON.stringify(body) });
        toast('Coupon created');
      }
      $('#couponModal').hidden = true;
      loadCoupons();
    } catch (err) { $('#couponErr').textContent = err.message; }
  });

  /* ---------- Misc ---------- */
  $$('[data-close]').forEach(b => b.addEventListener('click', () => {
    const m = b.closest('.modal');
    if (m) m.hidden = true;
  }));
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.hidden = true; }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal').forEach(m => m.hidden = true);
  });

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  async function boot() {
    $('#loginView').style.display = 'none';
    $('#appView').hidden = false;
    loadDashboard();
  }

  (async function init() {
    if (localStorage.getItem(TOKEN_KEY)) {
      try {
        await api('/admin/stats');
        boot();
        return;
      } catch (err) { localStorage.removeItem(TOKEN_KEY); }
    }
  })();
})();
