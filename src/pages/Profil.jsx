import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get, update } from '../config/firebase';
import { User, Mail, Save, AlertCircle, CheckCircle2, Phone, Trash2, Lock, ShieldCheck, Camera } from 'lucide-react';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const Profil = () => {
  const { currentUser, deleteAccount, userData } = useAuth();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showReauth, setShowReauth] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userRef = ref(database, `utilisateurs/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setNom(data.nom || '');
            setPrenom(data.prenom || '');
            setTelephone(data.telephone || '');
            setUsername(data.username || '');
            setEmail(currentUser.email || data.email || '');
            setNewEmail(currentUser.email || data.email || '');
          }
        } catch (error) {
          console.error(error);
          setMessage({ type: 'error', text: "Impossible de charger les données." });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      if (newEmail !== email || newPassword) {
        if (!currentPassword) {
          setShowReauth(true);
          setSaving(false);
          return;
        }
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        if (newEmail !== email) await updateEmail(currentUser, newEmail);
        if (newPassword) await updatePassword(currentUser, newPassword);
      }
      const userRef = ref(database, `utilisateurs/${currentUser.uid}`);
      await update(userRef, { nom, prenom, telephone, username, email: newEmail });
      setEmail(newEmail);
      setCurrentPassword('');
      setNewPassword('');
      setShowReauth(false);
      setMessage({ type: 'success', text: "Profil mis à jour avec succès !" });
    } catch (error) {
      setMessage({ type: 'error', text: "Erreur lors de la mise à jour." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Supprimer votre compte définitivement ?")) {
      setDeleting(true);
      try {
        await deleteAccount();
      } catch (error) {
        setMessage({ type: 'error', text: "Erreur de suppression." });
        setDeleting(false);
      }
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Chargement...</div>;

  const initials = (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || 'U';

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="page-title">Mon Profil</h1>
          <p style={{ color: 'var(--text-muted)' }}>Personnalisez votre expérience Tontine Connect.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: AVATAR & STATS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '60px', 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', fontWeight: 'bold', color: 'white',
                boxShadow: '0 8px 32px rgba(155, 81, 224, 0.3)',
                marginBottom: '20px'
              }}>
                {initials}
              </div>
              <button style={{ 
                position: 'absolute', bottom: '25px', right: '0',
                width: '36px', height: '36px', borderRadius: '18px',
                background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
              }}>
                <Camera size={18} />
              </button>
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{prenom} {nom}</h2>
            <p style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '14px', marginBottom: '20px' }}>@{username}</p>
            <div className={`badge ${userData?.role === 'super_admin' ? 'danger' : 'primary'}`} style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}>
              {userData?.role === 'super_admin' ? 'Super Administrateur' : 'Membre Premium'}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>Sécurité du compte</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2ecc71', fontSize: '14px' }}>
              <ShieldCheck size={20} /> Compte vérifié
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORMS */}
        <div className="glass-panel" style={{ padding: '40px' }}>
          {message.text && (
            <div className={`badge ${message.type === 'success' ? 'success' : 'danger'}`} style={{ width: '100%', padding: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>Informations Personnelles</h3>
              </div>
              
              <div className="form-group">
                <label className="form-label"><User size={14} /> Prénom</label>
                <input type="text" className="form-input" value={prenom} onChange={e => setPrenom(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label"><User size={14} /> Nom</label>
                <input type="text" className="form-input" value={nom} onChange={e => setNom(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} required />
              </div>

              <div className="form-group">
                <label className="form-label"><Phone size={14} /> Téléphone</label>
                <input type="tel" className="form-input" value={telephone} onChange={e => setTelephone(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>Accès & Sécurité</h3>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label"><Mail size={14} /> Adresse Email</label>
                <input type="email" className="form-input" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label"><Lock size={14} /> Nouveau mot de passe</label>
                <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Laisser vide pour ne pas changer" />
              </div>

              {showReauth && (
                <div style={{ gridColumn: 'span 2', padding: '24px', background: 'rgba(155, 81, 224, 0.05)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                  <p style={{ fontSize: '13px', marginBottom: '16px' }}>Veuillez confirmer votre mot de passe actuel :</p>
                  <input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Mot de passe actuel" required />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px' }}>
                <Save size={18} /> {saving ? 'Enregistrement...' : 'Sauvegarder le profil'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid rgba(231, 76, 60, 0.2)' }}>
            <h4 style={{ color: '#e74c3c', fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={16} /> Zone de danger
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Toutes vos données seront supprimées définitivement.</p>
              <button className="btn btn-outline" style={{ color: '#e74c3c', borderColor: '#e74c3c', padding: '8px 16px' }} onClick={handleDeleteAccount}>
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;
