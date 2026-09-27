/* =============================================
   GameStoB — Shared JavaScript
   Cart, Navbar, Toast, Utilities
   ============================================= */

// ── Game Data ──────────────────────────────────
const SHOPEE_URL = "https://shopee.co.id/";

const GAMES = [
  {
    id: 1,
    type: "game",
    title: "Resident Evil Requiem",
    genre: "Horror / Survival",
    platform: ["PC", "PS5"],
    price: 849000,
    origPrice: 999000,
    badge: "New",
    color: "#8b1a1a",
    img: "img/1a.jpg",
  },
  {
    id: 2,
    type: "game",
    title: "Resident Evil 2 Remake",
    genre: "Horror / Survival",
    platform: ["PC", "PS5", "Xbox"],
    price: 399000,
    origPrice: 549000,
    badge: "Sale",
    color: "#1a2a1a",
    img: "img/2a.jpg",
  },
  {
    id: 3,
    type: "game",
    title: "Monster Hunter Wilds",
    genre: "Action / RPG",
    platform: ["PC", "PS5", "Xbox"],
    price: 899000,
    origPrice: null,
    badge: "New",
    color: "#1a1208",
        img: 'img/3a.jpg',

  },
  {
    id: 4,
    type: "game",
    title: "Elden Ring",
    genre: "Action / RPG",
    platform: ["PC", "PS5", "Xbox"],
    price: 699000,
    origPrice: 849000,
    badge: "Sale",
    color: "#16140a",
     img: 'img/4a.webp',
  },
  {
    id: 5,
    type: "game",
    title: "Borderlands 4",
    genre: "FPS / Looter Shooter",
    platform: ["PC", "PS5", "Xbox"],
    price: 849000,
    origPrice: null,
    badge: "New",
    color: "#0a0f1a",
     img: 'img/5a.jpg',
  },
  {
    id: 6,
    type: "game",
    title: "Call of Duty: Black Ops 7",
    genre: "FPS / Shooter",
    platform: ["PC", "PS5", "Xbox"],
    price: 899000,
    origPrice: null,
    badge: "New",
    color: "#080c10",
    img: 'img/6a.jpg',
  },
  {
    id: 7,
    type: "game",
    title: "CoD: Modern Warfare III",
    genre: "FPS / Shooter",
    platform: ["PC", "PS5", "Xbox"],
    price: 649000,
    origPrice: 799000,
    badge: "Sale",
    color: "#0a0e12",
    img: 'img/7a.jpg',
  },
  {
    id: 8,
    type: "game",
    title: "Battlefield 6",
    genre: "FPS / Shooter",
    platform: ["PC", "PS5", "Xbox"],
    price: 849000,
    origPrice: null,
    badge: "New",
    color: "#0c1018",
    img: 'img/8a.webp',
  },
  {
    id: 9,
    type: "game",
    title: "Forza Horizon 6",
    genre: "Racing",
    platform: ["PC", "Xbox"],
    price: 749000,
    origPrice: null,
    badge: "New",
    color: "#0a1218",
    img: 'img/9a.jpg',
  },
  {
    id: 10,
    type: "game",
    title: "F1 25",
    genre: "Racing / Sports",
    platform: ["PC", "PS5", "Xbox"],
    price: 549000,
    origPrice: null,
    badge: "",
    color: "#120a0a",
    img: 'img/10a.jpg',
  },
  {
    id: 11,
    type: "game",
    title: "NBA 2K26",
    genre: "Sports",
    platform: ["PC", "PS5", "Xbox"],
    price: 599000,
    origPrice: null,
    badge: "New",
    color: "#080e1a",
    img: 'img/11a.jpg',
  },
  {
    id: 12,
    type: "game",
    title: "Starfield",
    genre: "RPG / Sci-Fi",
    platform: ["PC", "Xbox"],
    price: 499000,
    origPrice: 749000,
    badge: "Sale",
    color: "#06060f",
    img: 'img/12a.jpg',
  },
  {
    id: 13,
    type: "game",
    title: "Diablo IV",
    genre: "Action / RPG",
    platform: ["PC", "PS5", "Xbox"],
    price: 749000,
    origPrice: 899000,
    badge: "Sale",
    color: "#150308",
    img: 'img/13a.jpg',
  },
  {
    id: 14,
    type: "game",
    title: "The Witcher 3: Wild Hunt",
    genre: "RPG / Open World",
    platform: ["PC", "PS5", "Xbox"],
    price: 349000,
    origPrice: 549000,
    badge: "Sale",
    color: "#0f1408",
    img: 'img/14a.jpg',
  },
  {
    id: 15,
    type: "game",
    title: "Hitman: World of Assassination",
    genre: "Stealth / Action",
    platform: ["PC", "PS5", "Xbox"],
    price: 499000,
    origPrice: 649000,
    badge: "Sale",
    color: "#0e0808",
    img: 'img/15a.jpg',
  },
  {
    id: 16,
    type: "game",
    title: "007 First Light",
    genre: "Action / Stealth",
    platform: ["PC", "PS5", "Xbox"],
    price: 849000,
    origPrice: null,
    badge: "New",
    color: "#080a0e",
    img: 'img/16a.jpg',
  },
  {
    id: 17,
    type: "game",
    title: "Lies of P",
    genre: "Soulslike / Action",
    platform: ["PC", "PS5", "Xbox"],
    price: 449000,
    origPrice: 599000,
    badge: "Sale",
    color: "#100c14",
    img: 'img/17a.jpeg',
  },
  {
    id: 18,
    type: "game",
    title: "Red Dead Redemption 2",
    genre: "Action / Open World",
    platform: ["PC", "PS5"],
    price: 449000,
    origPrice: 649000,
    badge: "Sale",
    color: "#1a0f06",
    img: 'img/18a.jpg',
  },
  {
    id: 19,
    type: "game",
    title: "Cyberpunk 2077",
    genre: "RPG / Open World",
    platform: ["PC", "PS5", "Xbox"],
    price: 499000,
    origPrice: 799000,
    badge: "Sale",
    color: "#0a1018",
    img: 'img/19a.jpg',
  },
];

const DLCS = [
  {
    id: 101,
    type: "dlc",
    title: "RE Requiem: Shadow Protocol DLC",
    genre: "Horror / Survival",
    platform: ["PC", "PS5"],
    price: 149000,
    origPrice: null,
    badge: "DLC",
    parentId: 1,
     img: 'img/1b.webp',
  },
  {
    id: 102,
    type: "dlc",
    title: "RE2 Remake: Ghost Survivors DLC",
    genre: "Horror / Survival",
    platform: ["PC", "PS5", "Xbox"],
    price: 99000,
    origPrice: null,
    badge: "DLC",
    parentId: 2,
    img: 'img/2a.jpg',
  },
  {
    id: 103,
    type: "dlc",
    title: "Monster Hunter Wilds: Arch-Tempered Pack",
    genre: "Action / RPG",
    platform: ["PC", "PS5", "Xbox"],
    price: 179000,
    origPrice: null,
    badge: "DLC",
    parentId: 3,
    img: 'img/3a.jpg',
  },
  {
    id: 104,
    type: "dlc",
    title: "Elden Ring: Shadow of the Erdtree",
    genre: "Action / RPG",
    platform: ["PC", "PS5", "Xbox"],
    price: 349000,
    origPrice: null,
    badge: "DLC",
    parentId: 4,
    img: 'img/4a.webp',
  },
  {
    id: 105,
    type: "dlc",
    title: "Borderlands 4: Arms Race Season Pass",
    genre: "FPS / Looter Shooter",
    platform: ["PC", "PS5", "Xbox"],
    price: 249000,
    origPrice: null,
    badge: "DLC",
    parentId: 5,
    img: 'img/5a.jpg',
  },
  {
    id: 106,
    type: "dlc",
    title: "Black Ops 7: Combat Pack Bundle",
    genre: "FPS / Shooter",
    platform: ["PC", "PS5", "Xbox"],
    price: 129000,
    origPrice: null,
    badge: "DLC",
    parentId: 6,
    img: 'img/6a.jpg',
  },
  {
    id: 107,
    type: "dlc",
    title: "MW3: Vault Edition Extras",
    genre: "FPS / Shooter",
    platform: ["PC", "PS5", "Xbox"],
    price: 199000,
    origPrice: null,
    badge: "DLC",
    parentId: 7,
    img: 'img/7a.jpg',
  },
  {
    id: 108,
    type: "dlc",
    title: "Battlefield 6: Year 1 Pass",
    genre: "FPS / Shooter",
    platform: ["PC", "PS5", "Xbox"],
    price: 299000,
    origPrice: null,
    badge: "DLC",
    parentId: 8,
    img: 'img/8a.webp',
  },
  {
    id: 109,
    type: "dlc",
    title: "Forza H6: Car Pass Ultimate",
    genre: "Racing",
    platform: ["PC", "Xbox"],
    price: 249000,
    origPrice: null,
    badge: "DLC",
    parentId: 9,
    img: 'img/9a.jpg',
  },
  {
    id: 110,
    type: "dlc",
    title: "F1 25: My Team Expansion Pack",
    genre: "Racing / Sports",
    platform: ["PC", "PS5", "Xbox"],
    price: 99000,
    origPrice: null,
    badge: "DLC",
    parentId: 10,
    img: 'img/10a.jpg',
  },
  {
    id: 111,
    type: "dlc",
    title: "NBA 2K26: MyCareer Boost Pack",
    genre: "Sports",
    platform: ["PC", "PS5", "Xbox"],
    price: 129000,
    origPrice: null,
    badge: "DLC",
    parentId: 11,
    img: 'img/11a.jpg',
  },
  {
    id: 112,
    type: "dlc",
    title: "Starfield: Shattered Space",
    genre: "RPG / Sci-Fi",
    platform: ["PC", "Xbox"],
    price: 199000,
    origPrice: null,
    badge: "DLC",
    parentId: 12,
    img: 'img/12a.jpg',
  },
  {
    id: 113,
    type: "dlc",
    title: "Diablo IV: Vessel of Hatred",
    genre: "Action / RPG",
    platform: ["PC", "PS5", "Xbox"],
    price: 349000,
    origPrice: null,
    badge: "DLC",
    parentId: 13,
    img: 'img/13a.jpg',
  },
  {
    id: 114,
    type: "dlc",
    title: "Witcher 3: Blood and Wine DLC",
    genre: "RPG / Open World",
    platform: ["PC", "PS5", "Xbox"],
    price: 149000,
    origPrice: null,
    badge: "DLC",
    parentId: 14,
    img: 'img/14a.jpg',
  },
  {
    id: 115,
    type: "dlc",
    title: "Hitman: The Trinity Pack",
    genre: "Stealth / Action",
    platform: ["PC", "PS5", "Xbox"],
    price: 99000,
    origPrice: null,
    badge: "DLC",
    parentId: 15,
    img: 'img/15a.jpg',
  },
  {
    id: 116,
    type: "dlc",
    title: "007 First Light: Missions Expansion",
    genre: "Action / Stealth",
    platform: ["PC", "PS5", "Xbox"],
    price: 179000,
    origPrice: null,
    badge: "DLC",
    parentId: 16,
    img: 'img/16a.jpg',
  },
  {
    id: 117,
    type: "dlc",
    title: "Lies of P: Overture DLC",
    genre: "Soulslike / Action",
    platform: ["PC", "PS5", "Xbox"],
    price: 149000,
    origPrice: null,
    badge: "DLC",
    parentId: 17,
    img: 'img/17a.jpeg',
  },
  {
    id: 118,
    type: "dlc",
    title: "RDR2: Outlaw Pass Special Edition",
    genre: "Action / Open World",
    platform: ["PC", "PS5"],
    price: 129000,
    origPrice: null,
    badge: "DLC",
    parentId: 18,
    img: 'img/18a.jpg',
  },
  {
    id: 119,
    type: "dlc",
    title: "Cyberpunk 2077: Phantom Liberty",
    genre: "RPG / Open World",
    platform: ["PC", "PS5", "Xbox"],
    price: 249000,
    origPrice: null,
    badge: "DLC",
    parentId: 19,
    img: 'img/19a.jpg',
  },
];

const ALL_ITEMS = [...GAMES, ...DLCS];

// ── Cart State ─────────────────────────────────
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("gsb_cart") || "[]");
  } catch {
    return [];
  }
}
function setCart(cart) {
  localStorage.setItem("gsb_cart", JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(id) {
  const item = ALL_ITEMS.find((g) => g.id === id);
  if (!item) return;
  const cart = getCart();
  const existing = cart.find((c) => c.id === id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    showToast("🛒", item.title, `Quantity updated to ${existing.quantity}!`);
  } else {
    cart.push({
      id: item.id,
      title: item.title,
      price: item.price,
      type: item.type,
      img: item.img,
      platform: item.platform[0],
      quantity: 1,
    });
    showToast("🛒", item.title, "Added to cart!");
  }

  setCart(cart);
  bumpBadge();
}
function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((c) => c.id !== id);
  setCart(cart);
}
function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const count = getCart().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}
function bumpBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  badge.classList.add("bump");
  setTimeout(() => badge.classList.remove("bump"), 300);
}

// ── Toast ──────────────────────────────────────
function showToast(icon, title, msg) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-msg"><strong>${title}</strong>${msg}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("out");
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ── Format Price ───────────────────────────────
function formatPrice(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ── Card Builder ───────────────────────────────
function buildCard(item) {
  const badgeClass =
    item.badge === "DLC"
      ? "dlc"
      : item.badge === "New"
        ? "new"
        : item.badge === "Sale"
          ? "sale"
          : "";
  const badgeHtml = item.badge
    ? `<span class="card-badge ${badgeClass}">${item.badge}</span>`
    : "";
  const platforms = item.platform
    .map((p) => `<span class="platform-tag">${p}</span>`)
    .join("");
  const origHtml = item.origPrice
    ? `<span class="orig">${formatPrice(item.origPrice)}</span>`
    : "";
  return `
    <div class="game-card" data-id="${item.id}">
      <div class="card-img-wrap">
        <img src="${item.img}" alt="${item.title}" loading="lazy">
        ${badgeHtml}
        <div class="card-platform">${platforms}</div>
      </div>
      <div class="card-body">
        <div class="card-genre">${item.genre}</div>
        <div class="card-title">${item.title}</div>
        <div class="card-price">${origHtml}${formatPrice(item.price)}</div>
        <div class="card-actions">
          <a href="purchase.html" rel="noopener" class="btn-buy-now">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Buy Now
          </a>
          <button class="btn-add-cart" onclick="addToCart(${item.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>`;
}

// ── Navbar HTML ────────────────────────────────
function injectNavbar(activePage) {
  const pages = [
    { href: "index.html", label: "Home" },
    { href: "catalog.html", label: "Catalog" },
    { href: "purchase.html", label: "Purchase" },
    { href: "about.html", label: "About Us" },
    { href: "location.html", label: "Location" },
  ];
  const links = pages
    .map(
      (p) =>
        `<a href="${p.href}" class="${p.label === activePage ? "active" : ""}">${p.label}</a>`,
    )
    .join("");

  const cartCount = getCart().length;
  const badgeStyle = cartCount > 0 ? "" : "display:none";

  const html = `
  <nav class="navbar">
    <div class="nav-container">
      <a href="index.html" class="nav-logo">Game<span>Sto</span>B</a>
      <div class="nav-links">${links}</div>
      <div class="nav-right">
        <a href="purchase.html" class="cart-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Cart
          <span class="cart-badge" id="cart-badge" style="${badgeStyle}">${cartCount}</span>
        </a>
        <button class="hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>
  <div class="mobile-nav" id="mobile-nav">${links.replace(/<a /g, "<a ")}</div>`;

  const placeholder = document.getElementById("navbar-placeholder");
  if (placeholder) placeholder.outerHTML = html;
  else document.body.insertAdjacentHTML("afterbegin", html);

  // Mobile toggle
  document.getElementById("hamburger")?.addEventListener("click", () => {
    document.getElementById("mobile-nav")?.classList.toggle("open");
  });
}

// ── Footer HTML ────────────────────────────────
function injectFooter() {
  const html = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="nav-logo">Game<span>Sto</span>B</div>
          <p>Your ultimate destination for the latest PC, PlayStation, and Xbox titles. Premium games, unbeatable prices, delivered with passion.</p>
        </div>
        <div class="footer-col">
          <h4>Navigate</h4>
          <a href="index.html">Home</a>
          <a href="catalog.html">Catalog</a>
          <a href="purchase.html">Purchase</a>
          <a href="about.html">About Us</a>
          <a href="location.html">Location</a>
        </div>
        <div class="footer-col">
          <h4>Categories</h4>
          <a href="catalog.html">New Releases</a>
          <a href="catalog.html">On Sale</a>
          <a href="catalog.html">DLC & Add-ons</a>
          <a href="catalog.html">Action / RPG</a>
          <a href="catalog.html">Sports</a>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <a href="#">FAQ</a>
          <a href="#">Return Policy</a>
          <a href="#">Privacy Policy</a>
          <a href="location.html">Contact Us</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>GameStoB is a fictional store — a student UI/UX design project. No real orders or payments are processed.</span>
        <span>Game artwork © its respective publishers.</span>
      </div>
    </div>
  </footer>`;
  document.getElementById("footer-placeholder").outerHTML = html;
}

// ── Init on DOM ready ──────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});
