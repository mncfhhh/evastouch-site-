// Panier — persisté dans le navigateur (localStorage) le temps de la session
// d'achat. Pas de backend nécessaire pour ça, seule la commande finale
// (POST /api/order) va vers le serveur.

const CART_KEY = "evastouch_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

function addToCart(name, variant, price, quantity) {
  const items = getCart();
  const existing = items.find((i) => i.variant === variant);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ name, variant, price, quantity });
  }
  saveCart(items);
}

function updateCartItemQty(variant, quantity) {
  let items = getCart();
  if (quantity <= 0) {
    items = items.filter((i) => i.variant !== variant);
  } else {
    const item = items.find((i) => i.variant === variant);
    if (item) item.quantity = quantity;
  }
  saveCart(items);
}

function removeFromCart(variant) {
  const items = getCart().filter((i) => i.variant !== variant);
  saveCart(items);
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function getCartSubtotal() {
  return getCart().reduce((sum, i) => sum + i.quantity * i.price, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}
