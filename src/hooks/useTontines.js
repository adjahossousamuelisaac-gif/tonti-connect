import { useState, useEffect } from 'react';
import { database, ref, set, get, onValue, push, remove } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useTontines() {
  const { currentUser } = useAuth();
  const [tontines, setTontines] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setTontines([]);
      setInvitations([]);
      setLoading(false);
      return;
    }

    const tontinesRef = ref(database, 'tontines');
    const membresRef = ref(database, 'membres');
    
    const updateData = (tSnapshot, mSnapshot) => {
      const tData = tSnapshot.val() || {};
      const mData = mSnapshot.val() || {};
      
      const tontinesAcceptees = Object.values(mData)
        .filter(m => m.userId === currentUser.uid && m.statut === 'accepte')
        .map(m => m.tontineId);

      const tontinesInvitees = Object.values(mData)
        .filter(m => m.userId === currentUser.uid && m.statut === 'invite')
        .map(m => m.tontineId);

      const listAcceptees = Object.keys(tData).map(key => {
        const t = tData[key];
        const realCount = Object.values(mData).filter(m => m.tontineId === key && m.statut === 'accepte').length;
        return {
          id: key,
          ...t,
          nombreMembres: realCount
        };
      }).filter(t => 
        t.createurId === currentUser.uid || tontinesAcceptees.includes(t.id)
      );

      const listInvitations = Object.keys(tData).map(key => {
        const t = tData[key];
        const realCount = Object.values(mData).filter(m => m.tontineId === key && m.statut === 'accepte').length;
        return {
          id: key,
          ...t,
          nombreMembres: realCount
        };
      }).filter(t => tontinesInvitees.includes(t.id));
      
      setTontines(listAcceptees);
      setInvitations(listInvitations);
      setLoading(false);
    };

    let lastTSnap = null;
    let lastMSnap = null;

    const unsubT = onValue(tontinesRef, (snap) => {
      lastTSnap = snap;
      if (lastMSnap) updateData(lastTSnap, lastMSnap);
    });

    const unsubM = onValue(membresRef, (snap) => {
      lastMSnap = snap;
      if (lastTSnap) updateData(lastTSnap, lastMSnap);
    });

    return () => {
      unsubT();
      unsubM();
    };
  }, [currentUser]);

  const addTontine = async (tontineData) => {
    if (!currentUser) return;
    const tontinesRef = ref(database, 'tontines');
    const newTontineRef = push(tontinesRef);
    
    const tontineId = newTontineRef.key;
    
    await set(newTontineRef, {
      ...tontineData,
      createurId: currentUser.uid,
      dateCreation: Date.now(),
      cycleActuel: 1, 
      statut: 'active',
      ordreTour: [],
      nombreMembres: 1
    });

    const membresRef = ref(database, 'membres');
    const newMembreRef = push(membresRef);
    
    const userRef = ref(database, `utilisateurs/${currentUser.uid}`);
    const userSnap = await get(userRef);
    const userData = userSnap.val();

    await set(newMembreRef, {
      nom: userData?.nom || currentUser.displayName || currentUser.email,
      userId: currentUser.uid,
      tontineId: tontineId,
      numeroTour: 1,
      actif: true,
      statut: 'accepte', // Créateur est accepté d'office
      dateInscription: Date.now()
    });
    
    return tontineId;
  };

  const joinTontine = async (tontineId) => {
    if (!currentUser) return { error: "Vous devez être connecté" };

    const tontineRef = ref(database, `tontines/${tontineId}`);
    const tSnapshot = await get(tontineRef);
    if (!tSnapshot.exists()) return { error: "Tontine introuvable" };

    const membresRef = ref(database, 'membres');
    const mSnapshot = await get(membresRef);
    const mData = mSnapshot.val() || {};
    const isAlreadyMember = Object.values(mData).some(m => m.tontineId === tontineId && m.userId === currentUser.uid);
    
    if (isAlreadyMember) return { error: "Vous êtes déjà membre de cette tontine" };

    const userRef = ref(database, `utilisateurs/${currentUser.uid}`);
    const userSnap = await get(userRef);
    const userData = userSnap.val();

    const newMembreRef = push(membresRef);
    const currentMembresCount = Object.values(mData).filter(m => m.tontineId === tontineId).length;
    
    await set(newMembreRef, {
      nom: userData?.nom || currentUser.displayName || currentUser.email,
      userId: currentUser.uid,
      tontineId,
      numeroTour: currentMembresCount + 1,
      actif: true,
      statut: 'demande',
      dateInscription: Date.now()
    });

    return { success: true };
  };

  const deleteTontine = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tontine et toutes ses données (membres, paiements) ?')) {
      // 1. Supprimer la tontine
      await remove(ref(database, `tontines/${id}`));
      
      // 2. Supprimer les membres associés
      const membresRef = ref(database, 'membres');
      const mSnapshot = await get(membresRef);
      if (mSnapshot.exists()) {
        const mData = mSnapshot.val();
        const promises = Object.keys(mData)
          .filter(key => mData[key].tontineId === id)
          .map(key => remove(ref(database, `membres/${key}`)));
        await Promise.all(promises);
      }

      // 3. Supprimer les paiements associés
      const paiementsRef = ref(database, 'paiements');
      const pSnapshot = await get(paiementsRef);
      if (pSnapshot.exists()) {
        const pData = pSnapshot.val();
        const promises = Object.keys(pData)
          .filter(key => pData[key].tontineId === id)
          .map(key => remove(ref(database, `paiements/${key}`)));
        await Promise.all(promises);
      }
    }
  };

  return { tontines, invitations, loading, addTontine, deleteTontine, joinTontine };
}