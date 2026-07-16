let currentPricing = { home: 0, desk: 0 };
let currentDeliveryType = "home";

function fmtDA(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " DA";
}

function openCheckout() {
  document.getElementById("checkout-overlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
  renderCheckoutSummary();
  loadWilayasIntoCheckout();
}

function closeCheckout() {
  document.getElementById("checkout-overlay").classList.remove("is-open");
  document.body.style.overflow = "";
}

function renderCheckoutSummary() {
  const items = getCart();
  const box = document.getElementById("checkout-cart-summary");

  if (items.length === 0) {
    box.innerHTML = `<p class="empty-note">Votre panier est vide.</p>`;
  } else {
    box.innerHTML = items
      .map(
        (i) => `<div class="summary-line">
          <span>${i.quantity} × ${i.name} — ${i.variant}</span>
          <span>${fmtDA(i.quantity * i.price)}</span>
        </div>`
      )
      .join("");
  }
  updateTotals();
}

function updateTotals() {
  const subtotal = getCartSubtotal();
  const shipping = currentDeliveryType === "home" ? currentPricing.home : currentPricing.desk;
  document.getElementById("sum-subtotal").textContent = fmtDA(subtotal);
  document.getElementById("sum-shipping").textContent = shipping ? fmtDA(shipping) : "-- DA";
  document.getElementById("sum-total").textContent = fmtDA(subtotal + (shipping || 0));
}

async function loadWilayasIntoCheckout() {
  const select = document.getElementById("wilaya-select");
  select.innerHTML = `<option value="">-- Chargement... --</option>`;
  try {
    const wilayas = await getWilayas();
    select.innerHTML =
      `<option value="">-- Sélectionnez votre wilaya --</option>` +
      wilayas.map((w) => `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`).join("");
  } catch (err) {
    select.innerHTML = `<option value="">-- Erreur de chargement --</option>`;
    setCheckoutStatus(
      "Impossible de charger les wilayas. Le serveur met parfois ~30s à démarrer (Render) — réessaie dans un instant.",
      "error"
    );
  }
}

async function onWilayaChange() {
  const wilayaSelect = document.getElementById("wilaya-select");
  const communeSelect = document.getElementById("commune-select");
  const deskWrap = document.getElementById("desk-option-wrap");
  const wilayaId = wilayaSelect.value;

  communeSelect.innerHTML = `<option value="">-- Choisissez d'abord la wilaya --</option>`;
  communeSelect.disabled = true;
  deskWrap.style.display = "none";
  currentPricing = { home: 0, desk: 0 };
  updateTotals();

  if (!wilayaId) return;

  communeSelect.innerHTML = `<option value="">-- Chargement... --</option>`;
  try {
    const communes = await getCommunes(wilayaId);
    communeSelect.innerHTML =
      `<option value="">-- Sélectionnez votre commune --</option>` +
      communes
        .map((c) => `<option value="${c.id}" data-name="${c.name}" data-stopdesk="${c.hasStopDesk ? 1 : 0}">${c.name}</option>`)
        .join("");
    communeSelect.disabled = false;
  } catch (err) {
    communeSelect.innerHTML = `<option value="">-- Erreur de chargement --</option>`;
  }
}

async function onCommuneChange() {
  const wilayaSelect = document.getElementById("wilaya-select");
  const communeSelect = document.getElementById("commune-select");
  const deskWrap = document.getElementById("desk-option-wrap");
  const centerSelect = document.getElementById("center-select");
  const wilayaId = wilayaSelect.value;
  const communeId = communeSelect.value;
  const opt = communeSelect.selectedOptions[0];
  const hasStopDesk = opt && opt.dataset.stopdesk === "1";

  deskWrap.style.display = "none";
  centerSelect.innerHTML = "";

  if (!wilayaId || !communeId) return;

  try {
    currentPricing = await getDeliveryPricing(wilayaId, communeId);
  } catch {
    currentPricing = { home: 0, desk: 0 };
  }
  updateTotals();

  if (hasStopDesk) {
    deskWrap.style.display = "block";
    try {
      const centers = await getCenters(communeId);
      centerSelect.innerHTML = centers
        .map((c) => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`)
        .join("");
    } catch {
      centerSelect.innerHTML = `<option value="">-- Erreur de chargement --</option>`;
    }
  }
}

function onDeliveryTypeChange(type) {
  currentDeliveryType = type;
  document.getElementById("center-field").style.display = type === "desk" ? "grid" : "none";
  document.getElementById("address-field").style.display = type === "home" ? "grid" : "none";
  updateTotals();
}

function setCheckoutStatus(message, kind) {
  const el = document.getElementById("checkout-status");
  el.textContent = message;
  el.className = "form-status" + (kind ? " " + kind : "");
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const items = getCart();
  if (items.length === 0) {
    setCheckoutStatus("Votre panier est vide.", "error");
    return;
  }

  const form = e.target;
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const phone = form.phone.value.trim();
  const wilayaSelect = document.getElementById("wilaya-select");
  const communeSelect = document.getElementById("commune-select");
  const centerSelect = document.getElementById("center-select");
  const address = form.address.value.trim();

  const wilayaName = wilayaSelect.selectedOptions[0]?.dataset.name;
  const communeName = communeSelect.selectedOptions[0]?.dataset.name;

  if (!wilayaName || !communeName) {
    setCheckoutStatus("Merci de sélectionner votre wilaya et votre commune.", "error");
    return;
  }
  if (currentDeliveryType === "desk" && !centerSelect.value) {
    setCheckoutStatus("Merci de choisir un bureau Yalidine.", "error");
    return;
  }
  if (currentDeliveryType === "home" && !address) {
    setCheckoutStatus("Merci d'indiquer votre adresse.", "error");
    return;
  }

  const shippingCost = currentDeliveryType === "home" ? currentPricing.home : currentPricing.desk;
  const subtotal = getCartSubtotal();

  const payload = {
    customer: { firstName, lastName, phone },
    items: items.map((i) => ({ name: i.name, variant: i.variant, quantity: i.quantity, price: i.price })),
    subtotal,
    delivery: {
      wilayaName,
      communeName,
      type: currentDeliveryType,
      deskName: currentDeliveryType === "desk" ? centerSelect.selectedOptions[0]?.dataset.name : null,
      address: currentDeliveryType === "home" ? address : null,
      shippingCost,
    },
    shippingCost,
    total: subtotal + (shippingCost || 0),
  };

  const submitBtn = document.getElementById("checkout-submit");
  submitBtn.disabled = true;
  setCheckoutStatus("Envoi de la commande...", "");

  try {
    const result = await submitOrder(payload);
    setCheckoutStatus(`Commande confirmée${result.orderName ? " — " + result.orderName : ""} 🌸`, "ok");
    clearCart();
    setTimeout(() => {
      closeCheckout();
      renderCartDrawer();
    }, 1800);
  } catch (err) {
    setCheckoutStatus(err.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
}
