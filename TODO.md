# TODO - Afrimarket (édition secteurs/produits)

- [x] Ajouter secteurs manquants à la barre `.menu-categories` sur `index.html` (Maison, Services, Automobile, Bureautique, Sport).
- [ ] Propager `categorie` (et `vendeur` si dispo) depuis l’affichage de produits vers le panier.
- [ ] Utiliser `categorie` dans le calcul de commission côté `script.js` de manière fiable.
- [ ] Afficher la catégorie/secteur sur `produit.html`.
- [ ] Rendre le stock sur `produit.html` basé sur `produit.stock`/`produit.stockMax` si présent, sinon fallback.
- [ ] Unifier la logique favoris sur `produit.id` si présent, sinon sur `produit.nom`.
- [ ] Vérifier/ajuster `index.html` et `vendeur.html` pour que “Ajouter au panier” inclue `categorie`.
- [ ] Tester : home -> produit -> panier -> commande, avec secteurs existants + nouveaux.

