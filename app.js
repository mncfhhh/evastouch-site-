let selectedVariant = null;
let selectedQty = 1;

function renderVariants() {
  const list = document.getElementById("variant-list");
  list.innerHTML = "";

  VARIANTS.forEach((v) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "variant-btn" + (!v.available ? " is-unavailable" : "");
    btn.textContent = v.name;
    btn.disabled = !v.available;

    if (v.available) {
      btn.addEventListener("click", () => selectVariant(v.name, btn));
    }
    list.appendChild(btn);
  });

  // Sélectionne la première variante disponible par défaut
  const firstAvailable = VARIANTS.find((v) => v.available);
  if (firstAvailable) {
    const firstBtn = list.querySelector(".variant-btn:not(.is-unavailable)");
    selectVariant(firstAvailable.name, firstBtn);
  }
}

function selectVariant(name, btn) {
  selectedVariant = name;
  document.querySelectorAll(".variant-btn").forEach((el) => el.classList.remove("is-selected"));
  btn.classList.add("is-selected");
}

function changeQty(delta) {
  selectedQty = Math.max(1, selectedQty + delta);
  document.getElementById("qty-value").textContent = selectedQty;
}

function handleAddToCart() {
  if (!selectedVariant) return;
  addToCart(PRODUCT.name, selectedVariant, PRODUCT.price, selectedQty);
  selectedQty = 1;
  document.getElementById("qty-value").textContent = 1;

  const status = document.getElementById("add-status");
  status.textContent = "Ajouté au panier ✓";
  status.classList.add("is-visible");
  setTimeout(() => status.classList.remove("is-visible"), 1800);
}

function renderCartDrawer() {
  const items = getCart();
  const body = document.getElementById("cart-drawer-body");
  const footer = document.getElementById("cart-drawer-footer");

  if (items.length === 0) {
    body.innerHTML = `<p class="empty-note">Votre panier est vide.</p>`;
    footer.style.display = "none";
    return;
  }

  body.innerHTML = items
    .map(
      (i) => `
    <div class="cart-line" data-variant="${i.variant}">
      <div class="cart-line-info">
        <span class="cart-line-name">${i.name}</span>
        <span class="cart-line-variant">${i.variant}</span>
      </div>
      <div class="cart-line-controls">
        <div class="stepper stepper-sm">
          <button type="button" class="step-minus">-</button>
          <span>${i.quantity}</span>
          <button type="button" class="step-plus">+</button>
        </div>
        <span class="cart-line-price">${new Intl.NumberFormat("fr-FR").format(i.quantity * i.price)} DA</span>
        <button type="button" class="cart-line-remove" aria-label="Retirer">✕</button>
      </div>
    </div>`
    )
    .join("");

  body.querySelectorAll(".cart-line").forEach((line) => {
    const variant = line.dataset.variant;
    const item = items.find((i) => i.variant === variant);
    line.querySelector(".step-plus").addEventListener("click", () => {
      updateCartItemQty(variant, item.quantity + 1);
      renderCartDrawer();
    });
    line.querySelector(".step-minus").addEventListener("click", () => {
      updateCartItemQty(variant, item.quantity - 1);
      renderCartDrawer();
    });
    line.querySelector(".cart-line-remove").addEventListener("click", () => {
      removeFromCart(variant);
      renderCartDrawer();
    });
  });

  footer.style.display = "block";
  document.getElementById("cart-subtotal").textContent =
    new Intl.NumberFormat("fr-FR").format(getCartSubtotal()) + " DA";
}

function openCartDrawer() {
  renderCartDrawer();
  document.getElementById("cart-drawer").classList.add("is-open");
  document.getElementById("cart-overlay-bg").classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("is-open");
  document.getElementById("cart-overlay-bg").classList.remove("is-open");
  document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("product-title").textContent = PRODUCT.name;
  document.getElementById("product-price").textContent =
    "DA " + new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2 }).format(PRODUCT.price);
  document.getElementById("product-image").src = PRODUCT.image;

  renderVariants();
  updateCartBadge();

  document.getElementById("qty-minus").addEventListener("click", () => changeQty(-1));
  document.getElementById("qty-plus").addEventListener("click", () => changeQty(1));
  document.getElementById("add-to-cart-btn").addEventListener("click", handleAddToCart);

  document.getElementById("view-cart-btn").addEventListener("click", openCartDrawer);
  document.getElementById("cart-icon-btn").addEventListener("click", openCartDrawer);
  document.getElementById("cart-close-btn").addEventListener("click", closeCartDrawer);
  document.getElementById("cart-overlay-bg").addEventListener("click", closeCartDrawer);

  document.getElementById("checkout-btn").addEventListener("click", () => {
    closeCartDrawer();
    openCheckout();
  });
  document.getElementById("checkout-close-btn").addEventListener("click", closeCheckout);

  document.getElementById("wilaya-select").addEventListener("change", onWilayaChange);
  document.getElementById("commune-select").addEventListener("change", onCommuneChange);
  document.querySelectorAll('input[name="delivery-type"]').forEach((radio) => {
    radio.addEventListener("change", (e) => onDeliveryTypeChange(e.target.value));
  });
  document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);
});
