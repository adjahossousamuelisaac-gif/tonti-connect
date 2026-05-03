import { useState, useEffect } from 'react'

export function useLocalStorage(cle, valeurInitiale) {
    const [valeur, setValeur] = useState(() => {
        try {
            const item = localStorage.getItem(cle)
            return item !== null ? JSON.parse(item) : valeurInitiale
        } catch (erreur) {
            console.error("Erreur de lecture:", erreur)
            return valeurInitiale
        }
    })
    
    useEffect(() => {
        try {
            localStorage.setItem(cle, JSON.stringify(valeur))
        } catch (erreur) {
            console.error("Erreur d'écriture:", erreur)
        }
    }, [cle, valeur])
    
    const supprimer = () => {
        localStorage.removeItem(cle)
        setValeur(valeurInitiale)
    }
    
    return [valeur, setValeur, supprimer]
}