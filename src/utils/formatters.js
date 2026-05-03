// Format FCFA
export function formatFCFA(montant) {
    if (montant === undefined || montant === null) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

// Format date
export function formatDate(timestamp) {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Format date avec heure
export function formatDateTime(timestamp) {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Générer un ID unique
export function genererId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// Tronquer un texte
export function tronquerTexte(texte, longueur = 50) {
    if (!texte) return ''
    if (texte.length <= longueur) return texte
    return texte.substring(0, longueur) + '...'
}