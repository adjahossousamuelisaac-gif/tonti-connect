// src/hooks/usePaiements.js
import { useState, useEffect } from 'react'
import { database, ref, set, get, push, onValue, update, remove } from '../config/firebase'
import { genererId } from '../utils/formatters'
import { determinerBeneficiaire, verifierCycleComplet } from '../utils/calculsTontine'
import { useCallback } from 'react'

export function usePaiements(tontineId, cycleActuel, ordreTour, montant, nombreMembres, onCycleComplet) {
    const [paiements, setPaiements] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState(null)

    // Écouter les paiements en temps réel
    useEffect(() => {
        if (!tontineId) {
            setChargement(false)
            return
        }

        const paiementsRef = ref(database, 'paiements')
        
        const unsubscribe = onValue(paiementsRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                // Filtrer les paiements de cette tontine
                const paiementsList = Object.keys(data)
                    .filter(key => data[key].tontineId === tontineId)
                    .map(key => ({
                        id: key,
                        ...data[key]
                    }))
                setPaiements(paiementsList)
            } else {
                setPaiements([])
            }
            setChargement(false)
        }, (error) => {
            setErreur(error.message)
            setChargement(false)
        })

        return () => unsubscribe()
    }, [tontineId])

  // Demander un paiement (par le membre)
  async function demanderPaiement(membreId, cycle, montantPaye) {
    setChargement(true)
    try {
      const id = genererId()
      const paiementRef = ref(database, `paiements/${id}`)
      
      const beneficiaireId = determinerBeneficiaire(ordreTour, cycle)
      
      const paiement = {
        id: id,
        tontineId: tontineId,
        cycle: cycle,
        membreId: membreId,
        montant: parseFloat(montantPaye),
        dateDemande: Date.now(),
        statut: 'en_attente',
        beneficiaireId: beneficiaireId
      }
      
      await set(paiementRef, paiement)
      return paiement
    } catch (error) {
      setErreur(error.message)
      throw error
    } finally {
      setChargement(false)
    }
  }

  // Confirmer un paiement (par l'organisateur)
  async function confirmerPaiement(paiementId) {
    setChargement(true)
    try {
      const paiementRef = ref(database, `paiements/${paiementId}`)
      const snapshot = await get(paiementRef)
      if (!snapshot.exists()) throw new Error("Paiement introuvable")
      
      const pData = snapshot.val()
      
      await update(paiementRef, {
        statut: 'paye',
        dateConfirmation: Date.now()
      })
      
      // Vérifier si le cycle est complet
      const estComplet = verifierCycleComplet(nombreMembres, [...paiements.filter(p => p.id !== paiementId), { ...pData, statut: 'paye' }], pData.cycle)
      if (estComplet && onCycleComplet) {
        onCycleComplet(pData.cycle + 1)
      }
      
      return { success: true }
    } catch (error) {
      setErreur(error.message)
      throw error
    } finally {
      setChargement(false)
    }
  }

  // Enregistrer un paiement direct (par l'organisateur)
  async function enregistrerPaiement(membreId, cycle, montantPaye) {
    setChargement(true)
    try {
      const id = genererId()
      const paiementRef = ref(database, `paiements/${id}`)
      
      const beneficiaireId = determinerBeneficiaire(ordreTour, cycle)
      
      const paiement = {
        id: id,
        tontineId: tontineId,
        cycle: cycle,
        membreId: membreId,
        montant: parseFloat(montantPaye),
        datePaiement: Date.now(),
        statut: 'paye',
        beneficiaireId: beneficiaireId
      }
      
      await set(paiementRef, paiement)
      
      // Vérifier si le cycle est complet
      const estComplet = verifierCycleComplet(nombreMembres, [...paiements, paiement], cycle)
      if (estComplet && onCycleComplet) {
        onCycleComplet(cycle + 1)
      }
      
      return paiement
    } catch (error) {
      setErreur(error.message)
      throw error
    } finally {
      setChargement(false)
    }
  }

  // Vérifier si un membre a payé pour un cycle (confirmé uniquement)
  const aPaye = useCallback((membreId, cycle) => {
    return paiements.some(p => 
      p.membreId === membreId && 
      p.cycle === cycle && 
      p.statut === 'paye'
    )
  }, [paiements])

  // Vérifier si un paiement est en attente
  const estEnAttente = useCallback((membreId, cycle) => {
    return paiements.some(p => 
      p.membreId === membreId && 
      p.cycle === cycle && 
      p.statut === 'en_attente'
    )
  }, [paiements])

  // Calculer le montant collecté pour un cycle (confirmé uniquement)
  function montantCollecte(cycle) {
    const paiementsCycle = paiements.filter(p => p.cycle === cycle && p.statut === 'paye')
    return paiementsCycle.length * montant
  }

  // Obtenir les impayés pour le cycle actuel
  function getImpayes(membresList) {
    return membresList.filter(membre => !aPaye(membre.id, cycleActuel))
  }

  return {
    paiements,
    chargement,
    erreur,
    enregistrerPaiement,
    demanderPaiement,
    confirmerPaiement,
    aPaye,
    estEnAttente,
    montantCollecte,
    getImpayes
  }
}