import React from 'react';
import { useAllPaiements } from '../hooks/useAllPaiements';
import { CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Paiements = () => {
  const { paiements, loading } = useAllPaiements();

  if (loading) return <div style={{ padding: '40px' }}>Chargement des paiements...</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Historique des Paiements</h1>
        <p style={{ color: 'var(--text-muted)' }}>Suivi de toutes vos cotisations et collectes</p>
      </div>
      
      {paiements.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <CreditCard size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)' }}>Aucun paiement enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '14px' }}>
                <th style={{ padding: '16px' }}>Tontine</th>
                <th style={{ padding: '16px' }}>Membre</th>
                <th style={{ padding: '16px' }}>Cycle</th>
                <th style={{ padding: '16px' }}>Montant</th>
                <th style={{ padding: '16px' }}>Date</th>
                <th style={{ padding: '16px' }}>Statut</th>
                <th style={{ padding: '16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {paiements.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '15px' }}>
                  <td style={{ padding: '16px' }}>
                    <strong>{p.tontineNom}</strong>
                  </td>
                  <td style={{ padding: '16px' }}>{p.membreNom}</td>
                  <td style={{ padding: '16px' }}>N° {p.cycle}</td>
                  <td style={{ padding: '16px' }}>{p.montant.toLocaleString()} FCFA</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Calendar size={14} />
                       {new Date(p.datePaiement || p.dateDemande).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {p.statut === 'paye' ? (
                      <span className="badge success">Validé</span>
                    ) : (
                      <span className="badge warning">En attente</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Link to={`/tontines/${p.tontineId}`} className="btn btn-icon" title="Voir la tontine">
                       <ArrowRight size={18} color="var(--primary)" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Paiements;
