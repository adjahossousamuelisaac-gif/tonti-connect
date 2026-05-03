import React, { useState, useEffect } from 'react';
import { database, ref, get, update, remove } from '../../config/firebase';
import { auth } from '../../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { MessageSquare, Key, Check, Trash2, Mail } from 'lucide-react';

const AdminSupport = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const snapshot = await get(ref(database, 'support'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRequests(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReset = async (request) => {
    try {
      await sendPasswordResetEmail(auth, request.email);
      await update(ref(database, `support/${request.id}`), { status: 'approved' });
      alert(`Email de réinitialisation envoyé à ${request.email}`);
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi de l'email");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette requête ?")) {
      try {
        await remove(ref(database, `support/${id}`));
        fetchRequests();
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Chargement des requêtes...</div>;

  const recommendations = requests.filter(r => r.type === 'recommendation');
  const passwordResets = requests.filter(r => r.type === 'password_reset');

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Requêtes Support</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* RECOMMENDATIONS */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--primary)" /> Recommandations ({recommendations.length})
          </h2>
          {recommendations.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aucune recommandation en attente.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recommendations.map(r => (
                <div key={r.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5' }}>{r.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.userEmail}</span>
                    <button className="btn btn-icon" onClick={() => handleDelete(r.id)}><Trash2 size={16} color="var(--danger)" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PASSWORD RESETS */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="var(--warning)" /> Mots de passe oubliés ({passwordResets.length})
          </h2>
          {passwordResets.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aucune demande en attente.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {passwordResets.map(r => (
                <div key={r.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Mail size={16} color="var(--text-muted)" />
                    <span style={{ fontWeight: '500' }}>{r.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${r.status === 'approved' ? 'success' : 'warning'}`} style={{ textTransform: 'capitalize' }}>
                      {r.status === 'approved' ? 'Approuvé' : 'En attente'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {r.status === 'pending' && (
                        <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleApproveReset(r)}>
                          Approuver
                        </button>
                      )}
                      <button className="btn btn-icon" onClick={() => handleDelete(r.id)}><Trash2 size={16} color="var(--danger)" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
