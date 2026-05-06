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

  if (loading) return <div style={{ padding: '20px' }}>Chargement du tableau de bord...</div>;

  if (userData?.role === 'super_admin') {
    return <AdminDashboard />;
  }

  const totalTontines = tontines.length;
  const totalMembres = tontines.reduce((acc, t) => acc + (t.nombreMembres || 0), 0);
  const montantEstimeCollecte = 0; 

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bonjour, {currentUser?.email?.split('@')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Voici le résumé de vos opérations aujourd'hui.</p>
        </div>
        {currentUser?.email === 'isaacromarickevin@gmail.com' && userData?.role !== 'super_admin' && (
          <button className="btn btn-primary" onClick={handleElevate} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e74c3c', width: '100%' }}>
            <ShieldCheck size={20} /> Devenir Super Admin
          </button>
        )}
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        {/* CARTE FINANCES */}
        <div className="glass-panel animate-slide-up stagger-1" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -15, top: -15, opacity: 0.05 }}><Wallet size={100} /></div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fonds collectés</h3>
          <p style={{ fontSize: '32px', color: 'var(--text-main)', fontWeight: 'bold' }}>{montantEstimeCollecte} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>FCFA</span></p>
          <p style={{ fontSize: '13px', color: '#2ecc71', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> En attente des premiers paiements
          </p>
        </div>
        
        {/* CARTE MEMBRES */}
        <div className="glass-panel animate-slide-up stagger-2" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -15, top: -15, opacity: 0.05 }}><Users size={100} /></div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Membres totaux</h3>
          <p style={{ fontSize: '32px', color: 'var(--text-main)', fontWeight: 'bold' }}>{totalMembres}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>Répartis dans {totalTontines} tontine(s)</p>
        </div>
        
        {/* CARTE CYCLES */}
        <div className="glass-panel animate-slide-up stagger-3" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -15, top: -15, opacity: 0.05 }}><RefreshCw size={100} /></div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tontines Actives</h3>
          <p style={{ fontSize: '32px', color: 'var(--text-main)', fontWeight: 'bold' }}>{totalTontines}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>Toutes actives</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="var(--primary)" /> Dernières activités
        </h3>
        {totalTontines === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Aucune activité récente. Allez dans l'onglet "Tontines" pour commencer !</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tontines.slice(0, 5).map((t, index) => (
              <li key={t.id} style={{ 
                padding: '16px 0', 
                borderBottom: index !== Math.min(tontines.length, 5) - 1 ? '1px solid var(--border-color)' : 'none',
                display: 'flex', alignItems: 'center', gap: '16px'
              }}>
                <div style={{ background: 'rgba(155, 81, 224, 0.1)', padding: '10px', borderRadius: '50%', flexShrink: 0 }}>
                  <RefreshCw size={18} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.4' }}>Nouvelle tontine <strong>"{t.nom}"</strong> créée.</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Cycle: {t.frequence} - {t.montant} FCFA</p>
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
