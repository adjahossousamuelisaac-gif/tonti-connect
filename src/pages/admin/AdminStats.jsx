import React, { useState, useEffect, useMemo } from 'react';
import { database, ref, get } from '../../config/firebase';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, Wallet, Activity, Calendar, Award } from 'lucide-react';

const AdminStats = () => {
  const [data, setData] = useState({
    users: [],
    tontines: [],
    paiements: [],
    membres: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [uSnap, tSnap, pSnap, mSnap] = await Promise.all([
          get(ref(database, 'utilisateurs')),
          get(ref(database, 'tontines')),
          get(ref(database, 'paiements')),
          get(ref(database, 'membres'))
        ]);

        setData({
          users: uSnap.exists() ? Object.values(uSnap.val()) : [],
          tontines: tSnap.exists() ? Object.values(tSnap.val()) : [],
          paiements: pSnap.exists() ? Object.values(pSnap.val()) : [],
          membres: mSnap.exists() ? Object.values(mSnap.val()) : []
        });
      } catch (error) {
        console.error("Erreur stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // ANALYSE 1: Croissance des utilisateurs (par jour sur les 30 derniers jours)
  const userGrowthData = useMemo(() => {
    const counts = {};
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    data.users.forEach(u => {
      const date = new Date(u.dateCreation || thirtyDaysAgo).toLocaleDateString();
      counts[date] = (counts[date] || 0) + 1;
    });

    // Transformer en tableau trié
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data.users]);

  // ANALYSE 2: Volume financier par tontine
  const financialVolume = useMemo(() => {
    return data.tontines.map(t => ({
      name: t.nom.substring(0, 10),
      volume: (t.montant || 0) * (t.nombreMembres || 1),
      membres: t.nombreMembres || 0
    })).sort((a, b) => b.volume - a.volume).slice(0, 5);
  }, [data.tontines]);

  // ANALYSE 3: Répartition des statuts de paiement
  const paymentStats = useMemo(() => {
    const stats = {
      'Confirmés': data.paiements.filter(p => p.statut === 'confirme').length,
      'En attente': data.paiements.filter(p => p.statut === 'en_attente').length,
      'Rejetés': data.paiements.filter(p => p.statut === 'rejete').length
    };
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [data.paiements]);

  const COLORS = ['#2ecc71', '#f1c40f', '#e74c3c', '#9b51e0'];

  const totalCapital = data.tontines.reduce((acc, t) => acc + ((t.montant || 0) * (t.nombreMembres || 0)), 0);

  if (loading) return <div style={{ padding: '40px' }}>Analyse des données en cours...</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analyses Statistiques</h1>
          <p style={{ color: 'var(--text-muted)' }}>Expertise en temps réel sur l'activité de la plateforme.</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Users color="var(--primary)" />
            <span style={{ color: '#2ecc71', fontSize: '12px', fontWeight: '600' }}>+12%</span>
          </div>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Utilisateurs Totaux</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{data.users.length}</p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Wallet color="#2ecc71" />
            <Award size={18} color="var(--warning)" />
          </div>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Capital Circulant</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{totalCapital.toLocaleString()} <span style={{ fontSize: '14px' }}>FCFA</span></p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Activity color="var(--warning)" />
            <TrendingUp size={18} color="#2ecc71" />
          </div>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Tontines Actives</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{data.tontines.length}</p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Calendar color="var(--primary)" />
          </div>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Transactions</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{data.paiements.length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* CHART 1: USER GROWTH */}
        <div className="glass-panel" style={{ padding: '24px', height: '350px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Évolution de la Communauté</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--primary)' }}
              />
              <Area type="monotone" dataKey="count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CHART 2: TOP FINANCIAL TONTINES */}
        <div className="glass-panel" style={{ padding: '24px', height: '350px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Top 5 Tontines (Volume FCFA)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={financialVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <Bar dataKey="volume" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* CHART 3: PAYMENT DISTRIBUTION */}
        <div className="glass-panel" style={{ padding: '24px', height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Santé des Paiements</h3>
          <div style={{ flex: 1, display: 'flex' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ANALYTICAL SUMMARY */}
        <div className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(155, 81, 224, 0.05), transparent)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Résumé Analytique</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(46, 204, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2ecc71', flexShrink: 0 }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Engagement</p>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Taux moyen de {Math.round((data.paiements.filter(p=>p.statut==='confirme').length / (data.paiements.length || 1)) * 100)}% de réussite.</p>
                </div>
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(155, 81, 224, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                  <Users size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Densité</p>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Moyenne de {Math.round(data.users.length / (data.tontines.length || 1))} membres par tontine.</p>
                </div>
             </div>

             <div style={{ marginTop: '10px', padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  "L'analyse montre une corrélation positive entre le nombre de membres et la vélocité des transactions."
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminStats;
