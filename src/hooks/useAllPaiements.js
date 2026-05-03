import { useState, useEffect } from 'react';
import { database, ref, onValue } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useAllPaiements() {
  const { currentUser } = useAuth();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setPaiements([]);
      setLoading(false);
      return;
    }

    const paiementsRef = ref(database, 'paiements');
    const membresRef = ref(database, 'membres');
    const tontinesRef = ref(database, 'tontines');

    const unsubscribe = onValue(paiementsRef, (snapshot) => {
      const pData = snapshot.val() || {};
      
      onValue(membresRef, (mSnapshot) => {
        const mData = mSnapshot.val() || {};
        
        onValue(tontinesRef, (tSnapshot) => {
          const tData = tSnapshot.val() || {};
          
          // Trouver les tontines où l'utilisateur est impliqué (créateur ou membre)
          const mesTontinesIds = Object.keys(tData).filter(id => {
            const t = tData[id];
            const estCreateur = t.createurId === currentUser.uid;
            const estMembre = Object.values(mData).some(m => m.tontineId === id && m.userId === currentUser.uid);
            return estCreateur || estMembre;
          });

          const allPaiements = Object.keys(pData)
            .map(id => ({ id, ...pData[id] }))
            .filter(p => mesTontinesIds.includes(p.tontineId))
            .map(p => ({
              ...p,
              tontineNom: tData[p.tontineId]?.nom || 'Tontine inconnue',
              membreNom: Object.values(mData).find(m => m.id === p.membreId)?.nom || 'Membre inconnu'
            }))
            .sort((a, b) => (b.datePaiement || b.dateDemande) - (a.datePaiement || a.dateDemande));

          setPaiements(allPaiements);
          setLoading(false);
        }, { onlyOnce: true });
      }, { onlyOnce: true });
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { paiements, loading };
}
