import React, { useState, useEffect } from 'react';
import { database, ref, get, set, update, remove } from '../../config/firebase';
import { Database, Save, RefreshCw, AlertTriangle, Table, Code, Edit2, Check, X, Trash2 } from 'lucide-react';

const AdminDatabase = () => {
  const [activeTab, setActiveTab] = useState('table'); // 'table' or 'json'
  const [dbData, setDbData] = useState(null);
  const [rawJson, setRawJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Table state
  const [editingCell, setEditingCell] = useState(null); // { table, id, field, value }

  useEffect(() => {
    fetchDatabase();
  }, []);

  const fetchDatabase = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const snapshot = await get(ref(database));
      if (snapshot.exists()) {
        const val = snapshot.val();
        setDbData(val);
        setRawJson(JSON.stringify(val, null, 2));
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJson = async () => {
    if (!window.confirm("ATTENTION : Modifier directement le JSON peut corrompre l'application. Continuer ?")) return;
    setSaving(true);
    try {
      const parsedData = JSON.parse(rawJson);
      await set(ref(database), parsedData);
      setDbData(parsedData);
      setSuccess("Base de données mise à jour !");
    } catch (err) {
      setError("JSON Invalide.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCell = async () => {
    if (!editingCell) return;
    setSaving(true);
    try {
      const { table, id, field, value } = editingCell;
      // Convert value back to appropriate type if needed (simple check)
      let finalValue = value;
      if (value === 'true') finalValue = true;
      if (value === 'false') finalValue = false;
      if (!isNaN(value) && value !== '') finalValue = Number(value);

      await update(ref(database, `${table}/${id}`), { [field]: finalValue });
      setEditingCell(null);
      fetchDatabase();
      setSuccess("Valeur mise à jour !");
    } catch (err) {
      setError("Erreur de mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRow = async (tableName, id) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cette ligne (${id}) de la table ${tableName} ?`)) return;
    setSaving(true);
    try {
      await remove(ref(database, `${tableName}/${id}`));
      fetchDatabase();
      setSuccess("Ligne supprimée !");
    } catch (err) {
      setError("Erreur lors de la suppression.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Chargement des données...</div>;

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Gestionnaire de Données</h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button 
              className={`btn ${activeTab === 'table' ? 'btn-primary' : 'btn-outline'}`} 
              onClick={() => setActiveTab('table')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            >
              <Table size={18} /> Vue Tableaux
            </button>
            <button 
              className={`btn ${activeTab === 'json' ? 'btn-primary' : 'btn-outline'}`} 
              onClick={() => setActiveTab('json')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            >
              <Code size={18} /> Vue JSON
            </button>
          </div>
        </div>
        <button className="btn btn-outline" onClick={fetchDatabase}>
          <RefreshCw size={18} /> Rafraîchir
        </button>
      </div>

      {error && <div className="badge danger" style={{ width: '100%', padding: '12px', marginBottom: '16px' }}>{error}</div>}
      {success && <div className="badge success" style={{ width: '100%', padding: '12px', marginBottom: '16px', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>{success}</div>}

      <div className="glass-panel" style={{ padding: '24px' }}>
        {activeTab === 'json' ? (
          <div style={{ position: 'relative' }}>
            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              spellCheck="false"
              style={{
                width: '100%', height: '60vh', padding: '20px', 
                background: 'var(--bg-dark)',
                color: 'var(--text-main)', 
                fontFamily: 'monospace', fontSize: '13px', borderRadius: '8px',
                border: '1px solid var(--border-color)', resize: 'none'
              }}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleSaveJson} 
              disabled={saving}
              style={{ position: 'absolute', bottom: '20px', right: '20px' }}
            >
              <Save size={18} /> Sauvegarder JSON
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {dbData && Object.entries(dbData).map(([tableName, tableData]) => {
              if (typeof tableData !== 'object' || tableData === null) return null;
              
              // Extract columns from all items to handle heterogeneous data
              const items = Object.entries(tableData).map(([id, val]) => ({ id, ...val }));
              const columns = Array.from(new Set(items.flatMap(item => Object.keys(item))));
              
              return (
                <div key={tableName}>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px', marginBottom: '16px', color: 'var(--primary)' }}>
                    Table: {tableName}
                  </h3>
                  <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <tr>
                          {columns.map(col => <th key={col} style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>{col}</th>)}
                          <th style={{ padding: '12px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {columns.map(col => {
                              const isEditing = editingCell?.table === tableName && editingCell?.id === item.id && editingCell?.field === col;
                              const value = item[col];
                              return (
                                <td key={col} style={{ padding: '12px' }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <input 
                                        autoFocus
                                        className="form-input" 
                                        style={{ padding: '4px 8px', fontSize: '12px' }}
                                        value={editingCell.value} 
                                        onChange={e => setEditingCell({...editingCell, value: e.target.value})}
                                      />
                                      <button className="btn btn-icon" onClick={handleUpdateCell}><Check size={14} color="#2ecc71" /></button>
                                      <button className="btn btn-icon" onClick={() => setEditingCell(null)}><X size={14} /></button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', group: 'true' }}>
                                      <span style={{ 
                                        maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        color: col === 'id' ? 'var(--text-muted)' : 'inherit'
                                      }}>
                                        {typeof value === 'object' ? '{...}' : String(value ?? '')}
                                      </span>
                                      {col !== 'id' && typeof value !== 'object' && (
                                        <button className="btn btn-icon" style={{ opacity: 0 }} onClick={() => setEditingCell({ table: tableName, id: item.id, field: col, value: String(value ?? '') })}>
                                          <Edit2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <button 
                                className="btn btn-icon" 
                                title="Supprimer la ligne" 
                                onClick={() => handleDeleteRow(tableName, item.id)}
                              >
                                <Trash2 size={14} color="#e74c3c" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        td div:hover button { opacity: 1 !important; }
        .form-input { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; }
      `}</style>
    </div>
  );
};

export default AdminDatabase;
