import React, { useState, useEffect } from 'react';
import { database, ref, get, update, remove } from '../../config/firebase';
import { Edit2, X, Save, Trash2 } from 'lucide-react';

const AdminTontines = () => {
  const [tontines, setTontines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTontine, setEditingTontine] = useState(null);

  useEffect(() => {
    fetchTontines();
  }, []);

  const fetchTontines = async () => {
    try {
      const snapshot = await get(ref(database, 'tontines'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTontines(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { id, ...data } = editingTontine;
      await update(ref(database, `tontines/${id}`), data);
      setEditingTontine(null);
      fetchTontines();
    } catch (error) {
      console.error("Erreur de mise à jour", error);
    }
  };

  const handleDeleteTontine = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette tontine et toutes ses données associées (membres, paiements) ?")) {
      try {
        await remove(ref(database, `tontines/${id}`));
        
        // Nettoyage membres
        const mSnap = await get(ref(database, 'membres'));
        if (mSnap.exists()) {
          const mData = mSnap.val();
          Object.keys(mData).forEach(async (key) => {
            if (mData[key].tontineId === id) await remove(ref(database, `membres/${key}`));
          });
        }

        // Nettoyage paiements
        const pSnap = await get(ref(database, 'paiements'));
        if (pSnap.exists()) {
          const pData = pSnap.val();
          Object.keys(pData).forEach(async (key) => {
            if (pData[key].tontineId === id) await remove(ref(database, `paiements/${key}`));
          });
        }

        fetchTontines();
      } catch (error) {
        console.error("Erreur de suppression", error);
      }
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Chargement des tontines...</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Gestion des Tontines</h1>
      </div>
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Nom</th>
              <th style={{ padding: '12px' }}>Montant</th>
              <th style={{ padding: '12px' }}>Fréquence</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tontines.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>{t.id.substring(0,8)}...</td>
                <td style={{ padding: '12px' }}>{t.nom}</td>
                <td style={{ padding: '12px' }}>{t.montant} FCFA</td>
                <td style={{ padding: '12px' }}>{t.frequence}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-icon" onClick={() => setEditingTontine(t)}><Edit2 size={16} /></button>
                    <button className="btn btn-icon" onClick={() => handleDeleteTontine(t.id)}><Trash2 size={16} color="#e74c3c" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTontine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Modifier Tontine</h2>
              <button className="btn btn-icon" onClick={() => setEditingTontine(null)}><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input type="text" className="form-input" value={editingTontine.nom || ''} onChange={e => setEditingTontine({...editingTontine, nom: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Montant</label>
                <input type="number" className="form-input" value={editingTontine.montant || 0} onChange={e => setEditingTontine({...editingTontine, montant: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Fréquence</label>
                <input type="text" className="form-input" value={editingTontine.frequence || ''} onChange={e => setEditingTontine({...editingTontine, frequence: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}><Save size={18} /> Sauvegarder</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTontines;
