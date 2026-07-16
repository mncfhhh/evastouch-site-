# Eva's Touch — site vitrine + panier + commande COD

Site statique (HTML/CSS/JS pur) reproduisant le fonctionnement de la boutique Shopify : sélection de variante, panier, popup de commande connecté à ton backend Render existant (`eva-touch-cod-backend`), qui crée de vraies commandes Shopify.

## 1. Étape obligatoire : autoriser ce site sur ton backend Render

Ton backend (`server.js`) bloque les requêtes venant de domaines non autorisés (`ALLOWED_ORIGINS`). Sans ça, le popup de commande affichera une erreur de connexion.

1. Va sur ton dashboard Render → le service `eva-touch-cod-backend` → **Environment**.
2. Trouve la variable `ALLOWED_ORIGINS`.
3. Ajoute l'URL de ton site GitHub Pages à la liste (séparée par une virgule si plusieurs domaines), par exemple :
   ```
   https://TON-COMPTE.github.io
   ```
   (⚠️ sans le `/evastouch-site/` à la fin — juste le domaine)
4. Sauvegarde — Render redéploie automatiquement le service.

Sans cette étape, tu auras une erreur CORS dans le popup de commande.

## 2. Mettre le site en ligne sur GitHub Pages

1. Crée un repo GitHub (par ex. `evastouch-site`), upload tous les fichiers de ce dossier.
2. **Settings → Pages → Source** → branche `main`, dossier `/ (root)` → **Save**.
3. Le site est en ligne après 1-2 min à `https://TON-COMPTE.github.io/evastouch-site/`.

## 3. À savoir sur le backend Render (plan gratuit)

Le service se met en veille après une période d'inactivité. La première requête après une veille peut prendre ~30 secondes (le temps que le serveur redémarre) — c'est normal, pas un bug. Le popup affiche un message d'attente si le chargement des wilayas échoue au premier essai ; il suffit de réessayer quelques secondes après.

## 4. Vérifier les données renvoyées par l'API

Je n'ai pas le fichier `yalidine.js` (qui définit le format exact des données wilayas/communes/tarifs), donc `js/api.js` essaie plusieurs noms de champs possibles. Si après déploiement les wilayas se chargent mais que les tarifs de livraison affichent "-- DA" ou 0 DA, ouvre `js/api.js` et regarde la fonction `getDeliveryPricing` — il faudra probablement ajuster les noms de clés (`home`, `desk`, etc.) pour qu'ils correspondent exactement à ce que renvoie ton `yalidine.js`. Dis-moi ce que l'API retourne (tu peux ouvrir `https://eva-touch-cod-backend.onrender.com/api/wilayas` dans un navigateur pour voir le format) et je corrige.

## 5. Ajouter tes vraies photos

Actuellement une image placeholder (`images/placeholder.svg`) est utilisée pour le produit. Pour la remplacer :
1. Mets ta photo dans `images/` (par ex. `images/tablier.jpg`).
2. Dans `js/config.js`, change `image: "images/placeholder.svg"` en `image: "images/tablier.jpg"`.

Tu peux aussi donner une photo différente à chaque variante en ajoutant un champ `image` sur l'entrée correspondante dans `VARIANTS` (dans `js/config.js`) — dis-moi si tu veux que je branche ça une fois que tu as les photos.

## 6. Modifier prix, variantes, nom du produit

Tout est dans `js/config.js` — c'est le seul fichier à toucher pour :
- Changer le prix (`PRODUCT.price`)
- Changer le nom du produit
- Ajouter / renommer / retirer une couleur dans `VARIANTS`
- Marquer une couleur en rupture de stock (`available: false`)

## Structure du projet

```
evastouch-site/
├── index.html          page produit + panier + popup de commande
├── css/style.css        styles
├── js/
│   ├── config.js         backend URL, produit, variantes (fichier à éditer le plus souvent)
│   ├── api.js            appels au backend Render (wilayas, communes, tarifs, commande)
│   ├── cart.js            panier (stocké dans le navigateur)
│   ├── checkout.js        logique du popup de commande
│   └── app.js             logique de la page produit
├── images/               placeholder.svg (à remplacer par tes photos)
└── README.md
```
