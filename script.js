/* ---------- CATALOG ---------- */
const PRODUCTS = [
  { id: 'tp-01', name: 'Classic Cotton Tee',      category: 'Tops',     price: 35000,  emoji: '👕', color: '#dbe7f5' },
  { id: 'tp-02', name: 'Oversized Graphic Tee',   category: 'Tops',     price: 45000,  emoji: '👕', color: '#f5e3db' },
  { id: 'hd-01', name: 'Everyday Hoodie',         category: 'Hoodies',  price: 95000,  emoji: '🧥', color: '#e2e0f0' },
  { id: 'hd-02', name: 'Zip-Up Fleece Hoodie',    category: 'Hoodies',  price: 120000, emoji: '🧥', color: '#dfe9e2' },
  { id: 'jn-01', name: 'Slim Fit Denim Jeans',    category: 'Jeans',    price: 85000,  emoji: '👖', color: '#d6e2ef' },
  { id: 'jn-02', name: 'Relaxed Straight Jeans',  category: 'Jeans',    price: 90000,  emoji: '👖', color: '#e6e1d6' },
  { id: 'dr-01', name: 'Summer Midi Dress',       category: 'Dresses',  price: 110000, emoji: '👗', color: '#f6e0e6' },
  { id: 'dr-02', name: 'Wrap Evening Dress',      category: 'Dresses',  price: 145000, emoji: '👗', color: '#e8e0f2' },
  { id: 'sn-01', name: 'Canvas Low-Top Sneakers', category: 'Sneakers', price: 130000, emoji: '👟', color: '#e3ece6' },
  { id: 'sn-02', name: 'Running Trainers',        category: 'Sneakers', price: 165000, emoji: '👟', color: '#e6edf7' },
  { id: 'sd-01', name: 'Leather Strap Sandals',   category: 'Sandals',  price: 75000,  emoji: '🩴', color: '#f2e8da' },
  { id: 'sd-02', name: 'Comfort Slide Sandals',   category: 'Sandals',  price: 55000,  emoji: '🩴', color: '#e9e4dc' },
];

const WHATSAPP_NUMBER = '256700000000'; // ← REPLACE THIS WITH YOUR REAL WHATSAPP NUMBER LATER

/* ---------- STATE ---------- */
const CART_KEY = 'unibron-cart-v1';
let cart = loadCart();
let activeFilter = 'all';
let searchQuery = '';

const money = new Intl.NumberFormat('en-UG', {
  style: 'currency', currency: 'UGX', maximumFractionDigits: 0,
});

/* ---------- ELEMENTS ---------- */
const grid = document.getElementById('product-grid');
const filters = document.getElementById('filters');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const resultCount = document.getElementById('result-count');

const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const overlay = document.getElementById('overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartCountEl = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

/* ---------- STORAGE ---------- */
function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ---------- RENDER PRODUCTS ---------- */
function visibleProducts() {
  const q = searchQuery.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    const inCategory = activeFilter === 'all' || p.category === activeFilter;
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return inCategory && matchesSearch;
  });
}

function renderProducts() {
  const items = visibleProducts();

  grid.innerHTML = items
    .map(
      (p) => `
      <article class="card">
        <div class="product-media" style="--c:${p.color}" aria-hidden="true">${p.emoji}</div>
        <div class="product-body">
          <p class="product-cat">${p.category}</p>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-price">${money.format(p.price)}</p>
          <button class="btn add-btn" data-id="${p.id}">Add to cart</button>
        </div>
      </article>`
    )
    .join('');

  emptyState.hidden = items.length > 0;
  resultCount.textContent = `${items.length} product${items.length === 1 ? '' : 's'}`;
}

/* ---------- CART LOGIC ---------- */
function cartQty(id) {
  return cart.find((l) => l.id === id)?.qty ?? 0;
}

function addToCart(id) {
  const line = cart.find((l) => l.id === id);
  if (line) line.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  openCart();
}

function setQty(id, qty) {
  if (qty <= 0) {
    cart = cart.filter((l) => l.id !== id);
  } else {
    const line = cart.find((l) => l.id === id);
    if (line) line.qty = qty;
  }
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, line) => {
    const p = PRODUCTS.find((x) => x.id === line.id);
    return p ? sum + p.price * line.qty : sum;
  }, 0);
}

function cartItemCount() {
  return cart.reduce((n, l) => n + l.qty, 0);
}

function renderCart() {
  cartCountEl.textContent = cartItemCount();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
  } else {
    cartItemsEl.innerHTML = cart
      .map((line) => {
        const p = PRODUCTS.find((x) => x.id === line.id);
        if (!p) return '';
        return `
          <div class="cart-line">
            <div class="cart-thumb" style="--c:${p.color}" aria-hidden="true">${p.emoji}</div>
            <div>
              <h4>${p.name}</h4>
              <small>${money.format(p.price)}</small>
            </div>
            <div class="qty">
              <button data-dec="${p.id}" aria-label="Decrease quantity of ${p.name}">−</button>
              <span>${line.qty}</span>
              <button data-inc="${p.id}" aria-label="Increase quantity of ${p.name}">+</button>
            </div>
            <button class="line-remove" data-remove="${p.id}">Remove</button>
          </div>`;
      })
      .join('');
  }

  cartTotalEl.textContent = money.format(cartTotal());
  updateCheckoutLink();
}

function updateCheckoutLink() {
  if (cart.length === 0) {
    checkoutBtn.href = '#';
    checkoutBtn.setAttribute('aria-disabled', 'true');
    checkoutBtn.style.pointerEvents = 'none';
    checkoutBtn.style.opacity = '.5';
    return;
  }

  checkoutBtn.style.pointerEvents = '';
  checkoutBtn.style.opacity = '';

  const lines = cart.map((line) => {
    const p = PRODUCTS.find((x) => x.id === line.id);
    return p ? `• ${p.name} × ${line.qty} — ${money.format(p.price * line.qty)}` : '';
  });

  const message =
    `Hello Unibron-ug! I'd like to order:\n\n` +
    lines.join('\n') +
    `\n\nTotal: ${money.format(cartTotal())}\n\n` +
    `My name: \nDelivery address: \nPreferred payment (MTN MoMo / Airtel Money / Cash on delivery): `;

  checkoutBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  checkoutBtn.removeAttribute('aria-disabled');
}

/* ---------- DRAWER ---------- */
function openCart() {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartBtn.setAttribute('aria-expanded', 'true');
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('show'));
  document.body.style.overflow = 'hidden';
  closeCartBtn.focus();
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartBtn.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('show');
  setTimeout(() => { overlay.hidden = true; }, 200);
  document.body.style.overflow = '';
  cartBtn.focus();
}

/* ---------- EVENTS ---------- */
grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-btn');
  if (btn) addToCart(btn.dataset.id);
});

cartItemsEl.addEventListener('click', (e) => {
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  const rem = e.target.closest('[data-remove]');

  if (inc) setQty(inc.dataset.inc, cartQty(inc.dataset.inc) + 1);
  if (dec) setQty(dec.dataset.dec, cartQty(dec.dataset.dec) - 1);
  if (rem) setQty(rem.dataset.remove, 0);
});

filters.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  activeFilter = chip.dataset.filter;
  filters.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
  renderProducts();
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderProducts();
});

cartBtn.addEventListener('click', () => {
  cartDrawer.classList.contains('open') ? closeCart() : openCart();
});
closeCartBtn.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartDrawer.classList.contains('open')) closeCart();
});

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- INIT ---------- */
renderProducts();
renderCart();
