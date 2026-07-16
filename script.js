// ==========================================================================
// GESTION DU PANIER PRO - AFRIMARKET
// ==========================================================================

// ==========================================================================
// CATALOGUE GLOBAL - relie un nom de produit à son id/vendeur/categorie
// pour que le panier connaisse ces infos sans changer tous les boutons
// ==========================================================================
let catalogueParNom = {};
function enregistrerDansCatalogue(p) {
    if (!p || !p.nom) return;
    catalogueParNom[p.nom] = {
        produitId: p.id || null,
        vendeurId: p.vendeurId || null,
        categorie: p.categorie || ''
    };
}

// On récupère le panier stocké en mémoire sous forme de liste. Si vide, on crée un tableau vide []
let panier = localStorage.getItem("monPanierAfrimarket") ? JSON.parse(localStorage.getItem("monPanierAfrimarket")) : [];

// On met à jour les affichages dès le chargement de la page
mettreAJourAffichageMenu();
calculerFichePanier();

// Fonction principale pour ajouter un produit spécifique
function ajouterAuPanierSpecifique(nom, prix, image, quantite = 1) {
    quantite = Number(quantite || 1);
    if (quantite <= 0) quantite = 1;

    const infosCatalogue = catalogueParNom[nom] || { produitId: null, vendeurId: null, categorie: '' };

    // 1. On cherche si ce produit existe déjà dans le panier
    let produitExistant = panier.find(item => item.nom === nom);

    if (produitExistant) {
        // Si oui, on augmente juste sa quantité
        produitExistant.quantite += quantite;
    } else {
        // Si non, on l'ajoute comme nouveau produit dans la liste
        panier.push({
            nom: nom,
            prix: prix,
            image: image,
            quantite: quantite,
            produitId: infosCatalogue.produitId,
            vendeurId: infosCatalogue.vendeurId,
            categorie: infosCatalogue.categorie
        });
    }


    // 2. On sauvegarde la liste mise à jour dans la mémoire du navigateur
    localStorage.setItem("monPanierAfrimarket", JSON.stringify(panier));

    // 3. On actualise le compteur du menu
    mettreAJourAffichageMenu();
    
    // 4. On affiche une notification moderne au lieu d'une alerte
    const notification = document.getElementById("notification-panier");
    if (notification) {
        notification.style.display = 'block';
        // On cache la notification après 2.5 secondes
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2500);
    }
}

// Fonction pour mettre à jour le chiffre total dans le menu orange
function mettreAJourAffichageMenu() {
    let baliseCompteur = document.getElementById("compteur");
    if (baliseCompteur) {
        // On calcule le nombre total d'articles (somme des quantités)
        let totalArticles = panier.reduce((total, item) => total + item.quantite, 0);
        baliseCompteur.innerText = totalArticles;
    }
}

// ==========================================================================
// AFFICHAGE DYNAMIQUE DU TABLEAU PANIER (panier.html)
// ==========================================================================
function calculerFichePanier() {
    let corpsTableau = document.getElementById("corps-du-tableau");
    let blocAvecArticles = document.getElementById("panier-avec-articles");
    let blocPanierVide = document.getElementById("panier-vide");

    // Si on n'est pas sur la page panier.html, on s'arrête
    if (!blocAvecArticles) return;

    if (panier.length === 0) {
        blocAvecArticles.style.display = "none";
        blocPanierVide.style.display = "block";
    } else {
        blocAvecArticles.style.display = "block";
        blocPanierVide.style.display = "none";

        // On vide le tableau pour le reconstruire proprement et de manière sécurisée
        corpsTableau.innerHTML = "";
        let totalGeneral = 0;

        // On crée une ligne pour chaque produit
        panier.forEach((item, index) => {
            let sousTotal = item.prix * item.quantite;
            totalGeneral += sousTotal;

            const ligne = document.createElement('tr');

            // Colonne Produit
            const tdProduit = document.createElement('td');
            tdProduit.innerHTML = `
                <div class="produit-panier">
                    <img src="${item.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px;">
                    <div><strong></strong></div>
                </div>`;
            tdProduit.querySelector('strong').textContent = item.nom;
            ligne.appendChild(tdProduit);

            // Colonne Prix
            const tdPrix = document.createElement('td');
            tdPrix.textContent = `${item.prix.toLocaleString()} FCFA`;
            ligne.appendChild(tdPrix);

            // Colonne Quantité
            const tdQuantite = document.createElement('td');
            tdQuantite.innerHTML = `
                <div class="selecteur-quantite-panier">
                    <button onclick="changerQuantite(${index}, -1)">-</button>
                    <span>${item.quantite}</span>
                    <button onclick="changerQuantite(${index}, 1)">+</button>
                </div>`;
            ligne.appendChild(tdQuantite);

            // Colonne Sous-total
            const tdSousTotal = document.createElement('td');
            tdSousTotal.className = 'texte-vert';
            tdSousTotal.textContent = `${sousTotal.toLocaleString()} FCFA`;
            ligne.appendChild(tdSousTotal);

            // Colonne Actions
            const tdActions = document.createElement('td');
            const btnSupprimer = document.createElement('button');
            btnSupprimer.className = 'btn-supprimer-item';
            btnSupprimer.textContent = '✕';
            btnSupprimer.title = 'Supprimer cet article';
            btnSupprimer.onclick = () => supprimerItem(index);
            tdActions.appendChild(btnSupprimer);
            ligne.appendChild(tdActions);

            corpsTableau.appendChild(ligne);
        });

        // Mise à jour des blocs de prix totaux
        document.getElementById("resume-sous-total").innerText = totalGeneral.toLocaleString() + " FCFA";
        document.getElementById("total-final").innerText = totalGeneral.toLocaleString() + " FCFA";
    }
}

// Nouvelle fonction pour changer la quantité d'un article
function changerQuantite(index, changement) {
    if (panier[index]) {
        panier[index].quantite += changement;
        if (panier[index].quantite <= 0) {
            // Si la quantité tombe à 0 ou moins, on supprime l'article
            supprimerItem(index);
        } else {
            localStorage.setItem("monPanierAfrimarket", JSON.stringify(panier));
            mettreAJourAffichageMenu();
            calculerFichePanier();
        }
    }
}

// Nouvelle fonction pour supprimer un article spécifique
function supprimerItem(index) {
    const nomProduit = panier[index].nom;
    if (confirm(`Voulez-vous vraiment retirer "${nomProduit}" de votre panier ?`)) {
        panier.splice(index, 1); // Retire l'élément à l'index donné
        localStorage.setItem("monPanierAfrimarket", JSON.stringify(panier));
        mettreAJourAffichageMenu();
        calculerFichePanier();
    }
}

// ==========================================================================
// GESTION DES COMMANDES
// ==========================================================================
async function creerCommande(infosLivraison) {
    // 1. Validation simple des champs
    if (!infosLivraison.nom || !infosLivraison.tel || !infosLivraison.ville || !infosLivraison.adresse) {
        alert("⚠️ Veuillez remplir tous les champs pour la livraison.");
        return;
    }

    // ================================================================
    // COMMISSIONS (calculées au moment de la création de commande)
    // ================================================================
    // On fixe les abonnements à 0 (première version) selon votre consigne.
    const abosTotal = 0;
    const fraisLivraisonCfg = JSON.parse(localStorage.getItem('afrimarket_frais_livraison')) || {};
    const villeCmd = (infosLivraison.ville || '').toLowerCase();
    let fraisLiv = Number(fraisLivraisonCfg.autres || 3500);
    if (villeCmd.includes('brazza')) fraisLiv = Number(fraisLivraisonCfg.brazzaville || 1500);
    else if (villeCmd.includes('pointe')) fraisLiv = Number(fraisLivraisonCfg.pointenoire || 2000);


    // 2. Récupérer le panier et le total
    const totalCommande = panier.reduce((total, item) => total + (item.prix * item.quantite), 0);

    // 3. Calcul commissions (produits) + revenus
    // NOTE: calcul catégories via produit.categorie si dispo, sinon => 'Autres'
    // commission = prix * pct/100 (pct dépend de la catégorie)
    const tauxCfg = JSON.parse(localStorage.getItem('afrimarket_taux_commission')) || {};

    const calcPct = (categorie) => {
        const cat = (categorie || '').toLowerCase();
        let pct = Number(tauxCfg.autres || 10);
        if (cat.includes('electro') || cat.includes('télép') || cat.includes('inform')) pct = Number(tauxCfg.electronique || 10);
        else if (cat.includes('mode') || cat.includes('vêtement') || cat.includes('habit')) pct = Number(tauxCfg.mode || 12);
        else if (cat.includes('beauté') || cat.includes('beaute') || cat.includes('cosmét')) pct = Number(tauxCfg.beaute || 12);
        else if (cat.includes('épicerie') || cat.includes('epicerie') || cat.includes('alimenta')) pct = Number(tauxCfg.epicerie || 8);
        else if (cat.includes('enfant') || cat.includes('bébé') || cat.includes('jouet')) pct = Number(tauxCfg.enfants || 10);
        return pct;
    };

    let totalCommission = 0;
    let totalVendeurReçoit = 0;
    let commissionEntrees = [];

    panier.forEach((item) => {
        const prixUnitaire = Number(item.prix || 0);
        const qte = Number(item.quantite || 1);
        const totalProduit = prixUnitaire * qte;

        // catégorie/ville/vendeur
        const categorie = item.categorie || item.cat || 'Autres';
        // Normalisation légère des secteurs (pour mieux matcher calcPct)
        const catNorm = String(categorie || '').toLowerCase();
        const pct = calcPct(catNorm);

        const commission = Math.round(totalProduit * pct / 100);
        const vendeurReçoit = totalProduit - commission;

        totalCommission += commission;
        totalVendeurReçoit += vendeurReçoit;

        commissionEntrees.push({
            produit: item.nom,
            vendeur: item.vendeur || '',
            categorie,
            prixVente: totalProduit,
            pct,
            commission
        });
    });

    // Revenu livraison = frais (selon ville)
    const revenuLivraison = fraisLiv; 

    // Abonnements (fixé à 0)
    const revenuAbonnement = abosTotal;

    // 3. Créer l'objet commande
    const nouvelleCommande = {
        id: "AFRI-" + Date.now(), // ID de commande simple et unique
        date: new Date().toISOString(),
        produits: [...panier], // Copie du panier actuel
        total: totalCommande,
        livraison: infosLivraison,
        statut: "En attente", // Statut initial

        // Paiement/commission
        livraison_frais: revenuLivraison,
        commission_total: totalCommission,
        revenu_livraison: revenuLivraison,
        revenu_abonnement: revenuAbonnement,
        revenu_total_afrimarket: totalCommission + revenuLivraison + revenuAbonnement,
        commission_details: commissionEntrees
    };

    // ================================================================
    // 3b. ECRITURE REELLE DANS SUPABASE (commandes + commande_produits)
    // ================================================================
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();

        const { data: commandeCreee, error: erreurCommande } = await supabaseClient
            .from('commandes')
            .insert({
                client_id: session ? session.user.id : null,
                nom_client: infosLivraison.nom,
                telephone_client: infosLivraison.tel,
                ville: infosLivraison.ville,
                adresse: infosLivraison.adresse,
                mode_paiement: infosLivraison.modePaiement || 'Livraison Cash',
                total: totalCommande,
                frais_livraison: revenuLivraison,
                statut: 'En attente'
            })
            .select()
            .single();

        if (erreurCommande) {
            console.error('Erreur creation commande Supabase:', erreurCommande);
        } else {
            const lignesCommande = panier.map((item, i) => ({
                commande_id: commandeCreee.id,
                produit_id: item.produitId || null,
                vendeur_id: item.vendeurId || null,
                nom_produit: item.nom,
                prix_unitaire: item.prix,
                quantite: item.quantite,
                categorie: item.categorie || 'Autres',
                pourcentage_commission: commissionEntrees[i] ? commissionEntrees[i].pct : null,
                commission: commissionEntrees[i] ? commissionEntrees[i].commission : null,
                montant_vendeur: (item.prix * item.quantite) - (commissionEntrees[i] ? commissionEntrees[i].commission : 0)
            }));

            const { error: erreurLignes } = await supabaseClient
                .from('commande_produits')
                .insert(lignesCommande);

            if (erreurLignes) console.error('Erreur lignes de commande Supabase:', erreurLignes);
        }
    } catch (e) {
        console.error('Erreur inattendue lors de l\'enregistrement Supabase:', e);
    }

    // 4. Sauvegarder la commande dans l'historique (copie locale, en secours)
    const historique = JSON.parse(localStorage.getItem("historiqueCommandes")) || [];
    historique.push(nouvelleCommande);
    localStorage.setItem("historiqueCommandes", JSON.stringify(historique));

    // 4b. Enregistrer l'historique des commissions pour l'admin
    try {
        const historiqueComm = JSON.parse(localStorage.getItem('afrimarket_historique_commissions')) || [];
        const entreeGlobal = {
            id: Date.now(),
            date: new Date().toLocaleDateString('fr-FR'),
            produit: 'Commande (somme)',
            vendeur: '',
            categorie: 'Autres',
            prixVente: totalCommande,
            pct: null,
            commission: totalCommission,
            fraisLivraison: revenuLivraison,
            vendeurReçoit: totalVendeurReçoit,
            totalAfrimarket: nouvelleCommande.revenu_total_afrimarket
        };
        historiqueComm.unshift(entreeGlobal);
        localStorage.setItem('afrimarket_historique_commissions', JSON.stringify(historiqueComm));
    } catch (e) {}

    // 5. Vider le panier après la commande
    panier = [];

    localStorage.setItem("monPanierAfrimarket", JSON.stringify(panier));

    // 6. Mettre à jour l'interface et confirmer à l'utilisateur
    mettreAJourAffichageMenu();
    
    // Fermer la modal sur la page panier.html si elle existe
    const modal = document.getElementById("modal-livraison");
    if (modal) modal.classList.remove("active");

    alert(`🎉 Merci pour votre commande, ${infosLivraison.nom} !\n\nVotre commande n°${nouvelleCommande.id} a bien été enregistrée.\nLe vendeur vous contactera sous peu pour le paiement et la livraison.`);
    
    window.location.href = "commandes.html"; // Rediriger vers la page des commandes
}
// Fonction vider le panier
function viderLePanier() {
    if (confirm("Voulez-vous vraiment vider votre panier Afrimarket ?")) {
        panier = [];
        localStorage.setItem("monPanierAfrimarket", JSON.stringify(panier));
        mettreAJourAffichageMenu();
        calculerFichePanier();
    }
}

// ==========================================================================
// FONCTIONS ANNEXES (Page Connexion)
// ==========================================================================
function basculerMotDePasse(idChamp, icone) {
    let champ = document.getElementById(idChamp);
    if (champ.type === "password") { champ.type = "text"; icone.innerText = "🙈"; } 
    else { champ.type = "password"; icone.innerText = "👁️"; }
}

function gererInscription() {
    let nomSaisi = document.getElementById("nom").value;
    let typeCompte = document.getElementById("type-compte").value;
    if (nomSaisi.trim() === "") { alert("Veuillez remplir les champs."); return; }
    localStorage.setItem("nomBoutique", nomSaisi);
    if (typeCompte === "vendeur") { window.location.href = "vendeur.html"; } 
    else { window.location.href = "index.html"; }
}
// Fonction déclenchée lors du clic sur le nom d'un produit
function ouvrirProduit(produit) {
    // On met les détails dans la mémoire avant de changer de page
    localStorage.setItem("produitEnCours", JSON.stringify(produit));
}

// Fonction déclenchée lors du clic sur le nom d'un vendeur
function ouvrirProfilVendeur(nom, ville) {
    let vendeurSelectionne = {
        nom: nom,
        ville: ville
    };
    // On met les détails dans la mémoire avant de changer de page
    localStorage.setItem("vendeurEnCours", JSON.stringify(vendeurSelectionne));
    window.location.href = "profil-vendeur.html";
}

// Fonction pour ajouter un produit depuis sa fiche détaillée en respectant la quantité
function ajouterDepuisFiche() {
    let produitStocke = localStorage.getItem("produitEnCours");
    if (!produitStocke) return;

    let produit = JSON.parse(produitStocke);
    
    // On récupère la quantité choisie dans le menu déroulant de produit.html
    let quantiteChoisie = parseInt(document.getElementById("quantite-choisie").value);

    // On cherche si le produit est déjà dans le panier
    let produitExistant = panier.find(item => item.nom === produit.nom);

    if (produitExistant) {
        produitExistant.quantite += quantiteChoisie;
    } else {
        panier.push({
            nom: produit.nom,
            prix: produit.prix,
            image: produit.image,
            quantite: quantiteChoisie
        });
    }

    // On sauvegarde et on actualise tout
    localStorage.setItem("monPanierAfrimarket", JSON.stringify(panier));
    mettreAJourAffichageMenu();
    
    // On affiche une notification moderne au lieu d'une alerte
    const notification = document.getElementById("notification-panier");
    if (notification) {
        notification.style.display = 'block';
        // On cache la notification après 2.5 secondes
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2500);
    }
}