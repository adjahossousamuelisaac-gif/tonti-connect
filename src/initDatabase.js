// src/initDatabase.js
/*import { database, ref, set, get } from './config/firebase'

async function initialiserBaseDeDonnees() {
    console.log("🚀 Début de l'initialisation...")
    
    try {
        // 1. Créer la structure tontines
        const tontinesRef = ref(database, 'tontines')
        
        const tontine1 = {
            id: "tontine_1",
            nom: "Tontine des commerçantes de Treichville",
            montant: 5000,
            frequence: "mensuel",
            nombreMembres: 5,
            dateCreation: Date.now(),
            statut: "active",
            cycleActuel: 1,
            createurId: "user_123",
            ordreTour: ["membre_1", "membre_2", "membre_3", "membre_4", "membre_5"]
        }
        
        await set(ref(database, 'tontines/tontine_1'), tontine1)
        console.log("✅ Tontine créée")
        
        // 2. Créer les membres
        const membres = {
            membre_1: {
                id: "membre_1",
                nom: "Fatou Koné",
                telephone: "0707070707",
                tontineId: "tontine_1",
                numeroTour: 1,
                dateInscription: Date.now()
            },
            membre_2: {
                id: "membre_2",
                nom: "Aminata Diallo",
                telephone: "0707070708",
                tontineId: "tontine_1",
                numeroTour: 2,
                dateInscription: Date.now()
            },
            membre_3: {
                id: "membre_3",
                nom: "Mariam Traoré",
                telephone: "0707070709",
                tontineId: "tontine_1",
                numeroTour: 3,
                dateInscription: Date.now()
            },
            membre_4: {
                id: "membre_4",
                nom: "Aïcha Touré",
                telephone: "0707070710",
                tontineId: "tontine_1",
                numeroTour: 4,
                dateInscription: Date.now()
            },
            membre_5: {
                id: "membre_5",
                nom: "Ramatoulaye Sy",
                telephone: "0707070711",
                tontineId: "tontine_1",
                numeroTour: 5,
                dateInscription: Date.now()
            }
        }
        
        for (const [key, valeur] of Object.entries(membres)) {
            await set(ref(database, `membres/${key}`), valeur)
        }
        console.log("✅ 5 membres créés")
        
        // 3. Créer la structure paiements (vide pour l'instant)
        await set(ref(database, 'paiements'), {})
        console.log("✅ Structure paiements créée")
        
        // 4. Créer l'utilisateur admin
        await set(ref(database, 'utilisateurs/user_123'), {
            email: "admin@tontine.com",
            nom: "Admin Tontine",
            role: "admin"
        })
        console.log("✅ Utilisateur admin créé")
        
        console.log("🎉 Base de données initialisée avec succès !")
        
    } catch (erreur) {
        console.error("❌ Erreur lors de l'initialisation :", erreur)
    }
}

// Exécuter l'initialisation
initialiserBaseDeDonnees()*/