import { useState, useEffect } from 'react';
import { database, ref, set, get, onValue, push, remove, update } from '../config/firebase';

export function useMembres(tontineId) {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tontineId) {
      setMembres([]);
      setLoading(false);
      return;
    }

    const membresRef = ref(database, 'membres');
    
    // Dans une architecture Firestore, on utiliserait where(). Avec RealtimeDB classique :
    // Écoute en temps réel
    const unsubscribe = onValue(membresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listeMembres = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(m => m.tontineId === tontineId)
          .sort((a, b) => a.numeroTour - b.numeroTour);
        setMembres(listeMembres);
      } else {
        setMembres([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tontineId]);

  const addMembre = async (membreData) => {
    const membresRef = ref(database, 'membres');
    
    // Génération d'un ID numérique séquentiel
    const snapshot = await get(membresRef);
    let nextId = 1;
    if (snapshot.exists()) {
      const keys = Object.keys(snapshot.val()).map(k => parseInt(k)).filter(k => !isNaN(k));
      if (keys.length > 0) {
        nextId = Math.max(...keys) + 1;
      } else {
        nextId = Object.keys(snapshot.val()).length + 1;
      }
    }
    
    const newMembreRef = ref(database, 'membres/' + nextId);
    
    const currentMembres = await get(ref(database, 'membres')).then(s => {
       const d = s.val() || {};
       return Object.values(d).filter(m => m.tontineId === tontineId && m.statut === 'accepte');
    });
    const nextTour = currentMembres.length + 1;
    
    const status = membreData.statut || 'accepte';

    await set(newMembreRef, {
      ...membreData,
      tontineId,
      numeroTour: nextTour,
      actif: true,
      statut: status,
      dateInscription: Date.now()
    });

    if (status === 'accepte') {
      const tontineRef = ref(database, `tontines/${tontineId}`);
      const tData = (await get(tontineRef)).val();
      if(tData) {
        await update(tontineRef, { nombreMembres: (tData.nombreMembres || 0) + 1 });
      }
    }
    return nextId;
  };

  const inviteUser = async (user) => {
    const isAlreadyMember = membres.some(m => m.userId === user.id);
    if (isAlreadyMember) return { error: "Cet utilisateur est déjà membre ou invité" };

    await addMembre({
      nom: user.nom,
      prenom: user.prenom || '',
      username: user.username || '',
      telephone: user.telephone || '',
      userId: user.id,
      email: user.email,
      statut: 'invite' // L'organisateur invite, l'utilisateur devra accepter
    });
    return { success: true };
  };

  const accepterInvitation = async (membreId) => {
    const membreRef = ref(database, `membres/${membreId}`);
    await update(membreRef, { statut: 'accepte' });
    
    // Mettre à jour le compteur
    const tontineRef = ref(database, `tontines/${tontineId}`);
    const tData = (await get(tontineRef)).val();
    if(tData) {
      await update(tontineRef, { nombreMembres: (tData.nombreMembres || 0) + 1 });
    }
  };

  const refuserInvitation = async (membreId) => {
    await remove(ref(database, `membres/${membreId}`));
  };

  const deleteMembre = async (id) => {
    if (window.confirm("Voulez-vous supprimer ce membre ?")) {
      const m = membres.find(m => m.id === id);
      await remove(ref(database, `membres/${id}`));
      
      if (m && m.statut === 'accepte') {
        const tontineRef = ref(database, `tontines/${tontineId}`);
        const tData = (await get(tontineRef)).val();
        if(tData && tData.nombreMembres > 0) {
          await update(tontineRef, { nombreMembres: tData.nombreMembres - 1 });
        }
      }
    }
  };

  return { 
    membres: membres.filter(m => m.statut === 'accepte'), 
    demandes: membres.filter(m => m.statut === 'demande'), // Demandes d'adhésion (à approuver par l'organisateur)
    invitations: membres.filter(m => m.statut === 'invite'), // Invitations envoyées (à accepter par l'utilisateur)
    loading, 
    addMembre, 
    deleteMembre, 
    inviteUser,
    accepterInvitation,
    refuserInvitation
  };
}