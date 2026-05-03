// Calculer l'ordre des tours (rotation)
export function calculerOrdreTour(membres) {
    // Mélanger aléatoirement l'ordre des membres
    const ordre = [...membres]
    for (let i = ordre.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = ordre[i]
        ordre[i] = ordre[j]
        ordre[j] = temp
    }
    return ordre
}

// Déterminer qui est le bénéficiaire pour un cycle donné
export function determinerBeneficiaire(ordreTour, cycleActuel) {
    if (!ordreTour || ordreTour.length === 0) return null
    const index = (cycleActuel - 1) % ordreTour.length
    return ordreTour[index]
}

// Calculer le montant total collecté pour un cycle
export function calculerMontantCollecte(nombreMembres, montantParMembre, paiements, cycle) {
    const paiementsCycle = paiements.filter(p => p.cycle === cycle && p.statut === 'paye')
    return paiementsCycle.length * montantParMembre
}

// Vérifier si un cycle est complet (tous ont payé)
export function verifierCycleComplet(nombreMembres, paiements, cycle) {
    const paiementsCycle = paiements.filter(p => p.cycle === cycle && p.statut === 'paye')
    return paiementsCycle.length === nombreMembres
}

// Calculer le prochain cycle à traiter
export function calculerProchainCycle(paiements, nombreMembres) {
    let cycle = 1
    while (verifierCycleComplet(nombreMembres, paiements, cycle)) {
        cycle++
    }
    return cycle
}

// Calculer les impayés par membre
export function calculerImpayes(membres, paiements, cycleActuel) {
    return membres.filter(membre => {
        const aPaye = paiements.some(p => 
            p.membreId === membre.id && 
            p.cycle === cycleActuel && 
            p.statut === 'paye'
        )
        return !aPaye
    })
}

// Formater la fréquence
export function formaterFrequence(frequence) {
    const frequences = {
        'hebdomadaire': 'Chaque semaine',
        'mensuel': 'Chaque mois',
        'trimestriel': 'Chaque trimestre'
    }
    return frequences[frequence] || frequence
}