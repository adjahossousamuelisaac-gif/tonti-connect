import React, { useState, useEffect } from 'react';
import { database, ref, get } from '../../config/firebase';
import { Users, Package, LifeBuoy } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, tontines: 0, support: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, tontinesSnap, supportSnap] = await Promise.all([
          get(ref(database, 'utilisateurs')),
          get(ref(database, 'tontines')),
          get(ref(database, 'support'))
        ]);
        
        setStats({
          users: usersSnap.exists() ? Object.keys(usersSnap.val()).length : 0,
          tontines: tontinesSnap.exists() ? Object.keys(tontinesSnap.val()).length : 0,
          support: supportSnap.exists() ? Object.values(supportSnap.val()).filter(s => s.status === 'pending').length : 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '40px' }}>Chargement des statistiques...</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord Admin</h1>
          <p style={{ color: 'var(--text-muted)' }}>Vue d'ensemble de la plateforme.</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Utilisateurs totaux</h3>
          <p style={{ fontSize: '40px', color: 'var(--primary)', fontWeight: 'bold' }}>{stats.users}</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={16} /> Tontines actives</h3>
          <p style={{ fontSize: '40px', color: '#2ecc71', fontWeight: 'bold' }}>{stats.tontines}</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><LifeBuoy size={16} /> Requêtes en attente</h3>
          <p style={{ fontSize: '40px', color: '#e74c3c', fontWeight: 'bold' }}>{stats.support}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
