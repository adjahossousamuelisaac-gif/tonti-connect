import React, { useState, useEffect } from 'react';
import { database, ref, get, update, remove } from '../../config/firebase';
import { Edit2, X, Save, Trash2, Ban, CheckCircle } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await get(ref(database, 'utilisateurs'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsers(Object.keys(data).map(key => ({ id: key, ...data[key] })));
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
      const { id, ...data } = editingUser;
      await update(ref(database, `utilisateurs/${id}`), data);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Erreur de mise à jour", error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur et ses participations aux tontines ?")) {
      try {
        await remove(ref(database, `utilisateurs/${id}`));
        
        // Nettoyage participations (membres)
        const mSnap = await get(ref(database, 'membres'));
        if (mSnap.exists()) {
          const mData = mSnap.val();
          Object.keys(mData).forEach(async (key) => {
            if (mData[key].userId === id) await remove(ref(database, `membres/${key}`));
          });
        }

        fetchUsers();
      } catch (error) {
        console.error("Erreur de suppression", error);
      }
    }
  };

  const toggleBan = async (user) => {
    const newStatut = user.statut === 'banni' ? 'actif' : 'banni';
    try {
      await update(ref(database, `utilisateurs/${user.id}`), { statut: newStatut });
      fetchUsers();
    } catch (error) {
      console.error("Erreur de bannissement", error);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Chargement des utilisateurs...</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Gestion des Utilisateurs</h1>
      </div>
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '12px' }}>Nom / Prénom</th>
              <th style={{ padding: '12px' }}>Username</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Rôle</th>
              <th style={{ padding: '12px' }}>Statut</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px' }}>{u.prenom} {u.nom}</td>
                <td style={{ padding: '12px' }}>@{u.username}</td>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${u.role === 'super_admin' ? 'danger' : 'primary'}`}>{u.role}</span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${u.statut === 'banni' ? 'danger' : 'success'}`} style={{ fontSize: '11px' }}>
                    {u.statut || 'actif'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-icon" title="Modifier" onClick={() => setEditingUser(u)}><Edit2 size={16} /></button>
                    <button className="btn btn-icon" title={u.statut === 'banni' ? 'Débannir' : 'Bannir'} onClick={() => toggleBan(u)}>
                      {u.statut === 'banni' ? <CheckCircle size={16} color="#2ecc71" /> : <Ban size={16} color="#e74c3c" />}
                    </button>
                    <button className="btn btn-icon" title="Supprimer" onClick={() => handleDeleteUser(u.id)}><Trash2 size={16} color="#e74c3c" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Modifier Utilisateur</h2>
              <button className="btn btn-icon" onClick={() => setEditingUser(null)}><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select className="form-input" style={{ width: '100%' }} value={editingUser.role || 'user'} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                  <option value="user">Utilisateur</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-input" style={{ width: '100%' }} value={editingUser.statut || 'actif'} onChange={e => setEditingUser({...editingUser, statut: e.target.value})}>
                  <option value="actif">Actif</option>
                  <option value="banni">Banni</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input type="text" className="form-input" value={editingUser.nom || ''} onChange={e => setEditingUser({...editingUser, nom: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input type="text" className="form-input" value={editingUser.prenom || ''} onChange={e => setEditingUser({...editingUser, prenom: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-input" value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}><Save size={18} /> Sauvegarder</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
