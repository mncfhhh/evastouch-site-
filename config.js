// ---- Backend ----
// Ton serveur COD existant (Render). Doit autoriser l'origine de ce site
// dans sa variable d'environnement ALLOWED_ORIGINS — voir README.md.
const BACKEND_URL = "https://eva-touch-cod-backend.onrender.com";

// ---- Produit ----
const PRODUCT = {
  name: "Tabliers de cuisine anti taches et imperméable",
  price: 1800,
  image: "images/placeholder.svg",
};

// ---- Variantes ----
// Placeholders en attendant tes vraies photos. Renomme / réordonne / ajoute
// des entrées ici — chaque variante peut avoir sa propre image (facultatif,
// sinon l'image du produit ci-dessus est utilisée). Mets available: false
// pour une variante en rupture de stock (elle s'affiche barrée, non cliquable).
const VARIANTS = [
  { name: "Rose 🌸", available: true },
  { name: "Blanc 🐚", available: true },
  { name: "Blanc 🌸", available: true },
  { name: "Blanc 🌺", available: true },
  { name: "Vert clair 🍐", available: false },
  { name: "Bleu fond blanc 💙🌷", available: true },
  { name: "Orange fond blanc 🧡🌷", available: true },
  { name: "Vert fond blanc 💚🧡", available: true },
  { name: "Bleu 💙🌷", available: true },
  { name: "Jaune fond blanc 💛🌷", available: true },
];
