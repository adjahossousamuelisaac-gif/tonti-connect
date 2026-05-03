import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTontines } from '../hooks/useTontines';
import { Wallet, Users, RefreshCw, Activity, ShieldCheck } from 'lucide-react';
import { database, ref, update } from '../config/firebase';
import AdminDashboard from './admin/AdminDashboard';

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const { tontines, loading } = useTontines();

  const handleElevate = async () => {
    if (currentUser?.email === 'isaacromarickevin@gmail.com') {
      await update(ref(database, `utilisateurs/${currentUser.uid}`), { role: 'super_admin' });
      window.location.reload();
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Chargement du tableau de bord...</div>;

  if (userData?.role === 'super_admin') {
    return <AdminDashboard />;
  }

  const totalTontines = tontines.length;
  // Reduce safe check because nombreMembres could be undefined if they just created it
  const totalMembres = tontines.reduce((acc, t) => acc + (t.nombreMembres || 0), 0);
  
  // En attendant de coder le module de paiement complet, ceci est un placeholder statique pour le squelette
  const montantEstimeCollecte = 0; 

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bonjour, {currentUser?.email?.split('@')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)' }}>Voici le résumé de vos opérations aujourd'hui.</p>
        </div>
        {currentUser?.email === 'isaacromarickevin@gmail.com' && userData?.role !== 'super_admin' && (
          <button className="btn btn-primary" onClick={handleElevate} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e74c3c' }}>
            <ShieldCheck size={20} /> Devenir Super Admin
          </button>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* CARTE FINANCES */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05 }}><Wallet size={120} /></div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px' }}>Fonds collectés</h3>
          <p style={{ fontSize: '40px', color: 'var(--text-main)', fontWeight: 'bold' }}>{montantEstimeCollecte} <span style={{ fontSize: '20px', color: 'var(--text-muted)' }}>FCFA</span></p>
          <p style={{ fontSize: '14px', color: '#2ecc71', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> En attente des premiers paiements
          </p>
        </div>
        
        {/* CARTE MEMBRES */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05 }}><Users size={120} /></div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px' }}>Membres totaux</h3>
          <p style={{ fontSize: '40px', color: 'var(--text-main)', fontWeight: 'bold' }}>{totalMembres}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '12px' }}>Répartis dans {totalTontines} tontine(s)</p>
        </div>
        
        {/* CARTE CYCLES */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05 }}><RefreshCw size={120} /></div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px' }}>Tontines Actives</h3>
          <p style={{ fontSize: '40px', color: 'var(--text-main)', fontWeight: 'bold' }}>{totalTontines}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '12px' }}>Toutes actives</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="var(--primary)" /> Dernières activités
        </h3>
        {totalTontines === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Aucune activité récente. Allez dans l'onglet "Tontines" pour commencer !</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tontines.slice(0, 5).map((t, index) => (
              <li key={t.id} style={{ 
                padding: '16px 0', 
                borderBottom: index !== tontines.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                display: 'flex', alignItems: 'center', gap: '16px'
              }}>
                <div style={{ background: 'rgba(155, 81, 224, 0.1)', padding: '10px', borderRadius: '50%' }}>
                  <RefreshCw size={18} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)' }}>Nouvelle tontine <strong>"{t.nom}"</strong> créée.</p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Cycle: {t.frequence} - {t.montant} FCFA</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
