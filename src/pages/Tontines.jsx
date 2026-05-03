import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTontines } from '../hooks/useTontines';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Users, Wallet, Package, LogIn, AlertCircle, Mail, Check } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, get, update } from 'firebase/database';

const Tontines = () => {
  const { tontines, invitations, loading, addTontine, deleteTontine, joinTontine } = useTontines();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const [nom, setNom] = useState('');
  const [montant, setMontant] = useState('');
  const [frequence, setFrequence] = useState('mensuel');

  const [tontineIdToJoin, setTontineIdToJoin] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  const handleRepondre = async (tontineId, accepter) => {
    try {
      const membresRef = ref(database, 'membres');
      const snapshot = await get(membresRef);
      const data = snapshot.val() || {};
      const membreEntry = Object.entries(data).find(([id, m]) => m.tontineId === tontineId && m.userId === currentUser.uid);

      if (membreEntry) {
        const [membreId] = membreEntry;
        if (accepter) {
          const tontineRef = ref(database, `tontines/${tontineId}`);
          const tSnapshot = await get(tontineRef);
          const tData = tSnapshot.val();
          await Promise.all([
            update(ref(database, `membres/${membreId}`), { statut: 'accepte' }),
            update(tontineRef, { nombreMembres: (tData.nombreMembres || 0) + 1 })
          ]);
        } else {
          await update(ref(database, `membres/${membreId}`), { statut: 'refuse' });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Chargement des données Firebase...</div>;

  const handleCreate = async (e) => {
    e.preventDefault();
    await addTontine({
      nom,
      montant: Number(montant),
      frequence,
      nombreMembres: 0
    });
    setIsModalOpen(false);
    setNom(''); setMontant(''); setFrequence('mensuel');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    setIsJoining(true);
    const result = await joinTontine(tontineIdToJoin);
    if (result.success) {
      setIsJoinModalOpen(false);
      setTontineIdToJoin('');
    } else {
      setJoinError(result.error);
    }
    setIsJoining(false);
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Tontines</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gérez vos groupes d'épargne rotative</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => setIsJoinModalOpen(true)}>
            <LogIn size={20} /> Rejoindre
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Nouvelle
          </button>
        </div>
      </div>
      
      {invitations?.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
            <Mail size={20} /> Invitations Reçues ({invitations.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {invitations.map(t => (
              <div key={t.id} className="glass-panel" style={{ padding: '24px', border: '1px solid var(--primary)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{t.nom}</h3>
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleRepondre(t.id, true)}>
                    <Check size={18} /> Accepter
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleRepondre(t.id, false)}>
                    <X size={18} /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tontines.length === 0 ? (
        <div className="glass-panel animate-fade" style={{ padding: '64px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <Package size={64} color="var(--primary-light)" style={{ marginBottom: '24px' }} />
          <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Aucune tontine pour le moment</h3>
          <p style={{ fontSize: '16px', marginBottom: '32px' }}>Créez votre premier groupe ou rejoignez celui d'un ami pour commencer.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Créer une tontine</button>
            <button className="btn btn-outline" onClick={() => setIsJoinModalOpen(true)}>Rejoindre un groupe</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {tontines.map(t => (
            <div 
              key={t.id} 
              className="glass-panel" 
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => navigate(`/tontines/${t.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '4px', fontWeight: 'bold' }}>{t.nom}</h3>
                <span className={`badge ${t.createurId === currentUser?.uid ? 'primary' : 'success'}`}>
                  {t.createurId === currentUser?.uid ? 'Organisateur' : 'Membre'}
                </span>
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                    <Wallet size={18} color="var(--primary)" /> 
                  </div>
                  <span><strong style={{ color: 'var(--text-main)' }}>{t.montant.toLocaleString()} FCFA</strong> / {t.frequence}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                    <Users size={18} color="#2ecc71" /> 
                  </div>
                  <span>{t.nombreMembres || 0} Membres inscrits</span>
                </div>
                
                <div style={{ background: 'rgba(155, 81, 224, 0.05)', border: '1px solid var(--primary-light)', padding: '12px', borderRadius: '12px', marginTop: '12px' }}>
                  <p style={{ fontSize: '14px', margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>Cycle en cours :</strong></span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>N° {t.cycleActuel || 1}</span>
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-outline" style={{ flex: 1 }}>
                  Voir les détails
                </button>
                {t.createurId === currentUser?.uid && (
                  <button className="btn btn-icon" onClick={(e) => { e.stopPropagation(); deleteTontine(t.id); }} title="Supprimer la tontine">
                    <X size={20} color="var(--danger)" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CRÉATION */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '440px', padding: '32px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>Nouvelle Tontine</h2>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Nom du groupe</label>
                <input 
                  type="text" className="input-field" required
                  value={nom} onChange={e => setNom(e.target.value)}
                  placeholder="Ex: Tontine Famille"
                />
              </div>
              <div className="input-group">
                <label>Montant par personne et par cycle (FCFA)</label>
                <input 
                  type="number" className="input-field" required min="500"
                  value={montant} onChange={e => setMontant(e.target.value)}
                  placeholder="Ex: 5000"
                />
              </div>
              <div className="input-group" style={{ marginBottom: '32px' }}>
                <label>Fréquence de collecte</label>
                <select 
                  className="input-field" 
                  value={frequence} onChange={e => setFrequence(e.target.value)}
                  style={{ appearance: 'none', background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                >
                  <option value="hebdomadaire">Hebdomadaire (Chaque semaine)</option>
                  <option value="mensuel">Mensuel (Chaque mois)</option>
                </select>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                Créer la tontine
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REJOINDRE */}
      {isJoinModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '440px', padding: '32px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>Rejoindre un groupe</h2>
              <button className="btn btn-icon" onClick={() => setIsJoinModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleJoin}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                Saisissez l'identifiant de la tontine qui vous a été partagé.
              </p>
              <div className="input-group">
                <label>ID de la Tontine</label>
                <input 
                  type="text" className="input-field" required
                  value={tontineIdToJoin} onChange={e => setTontineIdToJoin(e.target.value)}
                  placeholder="Coller l'ID ici..."
                />
              </div>

              {joinError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>
                  <AlertCircle size={16} /> {joinError}
                </div>
              )}
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }} disabled={isJoining}>
                {isJoining ? 'Chargement...' : 'Rejoindre le groupe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tontines;
