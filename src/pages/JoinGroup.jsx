import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTontines } from '../hooks/useTontines';
import { database, ref, get } from '../config/firebase';
import { Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const JoinGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinTontine } = useTontines();
  const [tontine, setTontine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTontine = async () => {
      try {
        const tontineRef = ref(database, `tontines/${id}`);
        const snapshot = await get(tontineRef);
        if (snapshot.exists()) {
          setTontine(snapshot.val());
        } else {
          setError("Cette tontine n'existe pas ou le lien est invalide.");
        }
      } catch (err) {
        setError("Erreur lors de la récupération des détails.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTontine();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    setError('');
    const result = await joinTontine(id);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate(`/tontines/${id}`), 2000);
    } else {
      setError(result.error);
    }
    setJoining(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Chargement de l'invitation...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        {success ? (
          <div className="animate-scale">
            <CheckCircle size={64} color="#2ecc71" style={{ marginBottom: '24px' }} />
            <h2 style={{ marginBottom: '12px' }}>Bienvenue dans le groupe !</h2>
            <p style={{ color: 'var(--text-muted)' }}>Vous avez rejoint avec succès la tontine <strong>{tontine?.nom}</strong>.</p>
            <p style={{ marginTop: '24px', fontSize: '14px' }}>Redirection en cours...</p>
          </div>
        ) : (
          <>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(155, 81, 224, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Users size={40} color="var(--primary)" />
            </div>
            
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Rejoindre une Tontine</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Vous avez été invité à rejoindre le groupe d'épargne suivant :</p>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px', textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>{tontine?.nom}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '15px' }}>
                <span>Cotisation :</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{tontine?.montant.toLocaleString()} FCFA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px' }}>
                <span>Fréquence :</span>
                <span style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{tontine?.frequence}</span>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', background: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '14px' }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px' }}
                onClick={handleJoin}
                disabled={joining || !!error}
              >
                {joining ? 'Traitement...' : 'Confirmer et rejoindre'}
              </button>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/tontines')}>
                Annuler
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinGroup;
