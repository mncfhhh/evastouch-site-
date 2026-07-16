// Petites fonctions d'appel au backend Render (routes définies dans server.js).

async function apiGet(path) {
  const res = await fetch(BACKEND_URL + path);
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.success === false) {
    throw new Error((json && json.error) || "Erreur de connexion au serveur.");
  }
  return json.data;
}

// Récupère une valeur dans un objet en essayant plusieurs noms de clé
// possibles (la forme exacte renvoyée par yalidine.js n'est pas garantie).
function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return null;
}

async function getWilayas() {
  const data = await apiGet("/api/wilayas");
  return (data || []).map((w) => ({
    id: pick(w, ["id", "wilaya_id"]),
    name: pick(w, ["name", "wilaya_name"]),
  }));
}

async function getCommunes(wilayaId) {
  const data = await apiGet(`/api/communes?wilaya_id=${encodeURIComponent(wilayaId)}`);
  return (data || []).map((c) => ({
    id: pick(c, ["id", "commune_id"]),
    name: pick(c, ["name", "commune_name"]),
    // Yalidine renvoie has_stop_desk en 0/1 (nombre), pas un booléen.
    hasStopDesk: Number(pick(c, ["has_stop_desk", "hasStopDesk"]) || 0) === 1,
  }));
}

async function getCenters(communeId) {
  const data = await apiGet(`/api/centers?commune_id=${encodeURIComponent(communeId)}`);
  return (data || []).map((c) => ({
    id: pick(c, ["id", "center_id"]),
    name: pick(c, ["name", "center_name"]),
  }));
}

async function getDeliveryPricing(wilayaId, communeId) {
  const data = await apiGet(
    `/api/delivery-pricing?to_wilaya_id=${encodeURIComponent(wilayaId)}&commune_id=${encodeURIComponent(communeId)}`
  );
  return {
    home: Number(pick(data, ["home", "domicile", "home_fee", "tarif_domicile"]) || 0),
    desk: Number(pick(data, ["desk", "stopdesk", "desk_fee", "tarif_stopdesk", "bureau"]) || 0),
  };
}

async function submitOrder(payload) {
  const res = await fetch(`${BACKEND_URL}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.success === false) {
    const err = new Error((json && json.error) || "Erreur lors de l'envoi de la commande.");
    err.details = json && json.details;
    throw err;
  }
  return json;
}
