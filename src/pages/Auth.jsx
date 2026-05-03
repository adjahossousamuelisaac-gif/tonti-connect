import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, push } from '../config/firebase';
import { Package, Lock, Mail, User, ShieldCheck, ArrowRight, Phone } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login, register, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, nom, prenom, telephone);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe doit faire au moins 6 caractères.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Identifiants invalides.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await push(ref(database, 'support'), {
        email: forgotEmail,
        type: 'password_reset',
        status: 'pending',
        timestamp: Date.now()
      });
      setInfo("Votre demande de réinitialisation a été envoyée à l'admin. Vous recevrez un email dès qu'elle sera approuvée.");
      setForgotEmail('');
      setTimeout(() => setShowForgot(false), 5000);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi de la demande.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split-layout">
      {/* SECTION IMAGE GAUCHE */}
      <div className="auth-hero animate-fade">
        <div className="auth-hero-overlay"></div>
        <div className="auth-hero-content">
          <div className="auth-brand">
            <Package size={32} color="#c084fc" />
            <span>Tontine Connect</span>
          </div>
          <div className="auth-hero-text">
            <h1>Digitalisez vos tontines.<br/>Gagnez en transparence.</h1>
            <p>La plateforme panafricaine de référence pour gérer vos cycles d'épargne rotative et suivre les versements en toute simplicité.</p>
            <div className="auth-badges">
              <span className="badge-glass"><ShieldCheck size={18} color="#2ecc71"/> Paiements traçables</span>
              <span className="badge-glass"><User size={18} color="#c084fc"/> Multi-membres</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION FORMULAIRE DROITE */}
      <div className="auth-form-section">
        <div className="auth-form-container animate-fade">
          <div className="auth-form-header">
            <h2>{isLogin ? 'Bon retour !' : 'Créer votre compte'}</h2>
            <p>{isLogin ? 'Saisissez vos identifiants pour continuer.' : 'Rejoignez-nous et lancez votre première tontine aujourd\'hui.'}</p>
          </div>

          {error && <div className="badge danger" style={{ padding: '12px', width: '100%', marginBottom: '24px', justifyContent: 'center' }}>{error}</div>}
          {info && <div className="badge success" style={{ padding: '12px', width: '100%', marginBottom: '24px', justifyContent: 'center', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>{info}</div>}

            {showForgot ? (
              <form onSubmit={handleForgot} className="auth-form-body">
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Saisissez votre email. Une demande sera envoyée à l'administrateur pour valider votre réinitialisation.
                </p>
                <div className="input-field-group">
                  <label>Votre adresse Email</label>
                  <div className="input-with-icon">
                    <Mail className="icon-left" size={20} />
                    <input 
                      type="email" 
                      value={forgotEmail} 
                      onChange={(e) => setForgotEmail(e.target.value)} 
                      required 
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                <button disabled={loading} type="submit" className="btn-solid-primary" style={{ marginTop: '20px' }}>
                  <span>{loading ? 'Envoi...' : 'Envoyer la demande'}</span>
                </button>
                <button type="button" className="text-link" style={{ marginTop: '16px', alignSelf: 'center' }} onClick={() => setShowForgot(false)}>
                  Retour à la connexion
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form-body">
                {!isLogin && (
                  <>
                    <div className="input-field-group">
                      <label>Prénom</label>
                      <div className="input-with-icon">
                        <User className="icon-left" size={20} />
                        <input 
                          type="text" 
                          value={prenom} 
                          onChange={(e) => setPrenom(e.target.value)} 
                          required={!isLogin}
                          placeholder="Ex: Oumar"
                        />
                      </div>
                    </div>
                    <div className="input-field-group">
                      <label>Nom</label>
                      <div className="input-with-icon">
                        <User className="icon-left" size={20} />
                        <input 
                          type="text" 
                          value={nom} 
                          onChange={(e) => setNom(e.target.value)} 
                          required={!isLogin}
                          placeholder="Ex: Diallo"
                        />
                      </div>
                    </div>
                    <div className="input-field-group">
                      <label>Numéro de téléphone</label>
                      <div className="input-with-icon">
                        <Phone className="icon-left" size={20} />
                        <input 
                          type="tel" 
                          value={telephone} 
                          onChange={(e) => setTelephone(e.target.value)} 
                          required={!isLogin}
                          placeholder="Ex: +221 77 123 45 67"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="input-field-group">
                  <label>Adresse Email</label>
                  <div className="input-with-icon">
                    <Mail className="icon-left" size={20} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="gerant@tontine.com"
                    />
                  </div>
                </div>
                
                <div className="input-field-group" style={{ marginBottom: isLogin ? '10px' : '32px' }}>
                  <label>Mot de passe</label>
                  <div className="input-with-icon">
                    <Lock className="icon-left" size={20} />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      minLength="6"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {isLogin && (
                  <div style={{ textAlign: 'right', marginBottom: '30px' }}>
                    <button type="button" className="text-link" onClick={() => setShowForgot(true)} style={{ fontSize: '13px' }}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                <button disabled={loading} type="submit" className="btn-solid-primary">
                  <span>{loading ? 'Patientez...' : (isLogin ? 'Se connecter' : 'Créer mon compte')}</span>
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>
            )}

          <p className="auth-toggle-text">
            {isLogin ? "Vous n'avez pas encore de compte ?" : "Vous avez déjà un compte ?"}
            <button 
              type="button" 
              className="text-link" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
