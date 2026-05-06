import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, push } from '../config/firebase';
import { Send, CheckCircle2, ChevronDown, ChevronUp, HelpCircle, MessageSquare } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass-panel" style={{ marginBottom: '12px', padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: isOpen ? 'rgba(155, 81, 224, 0.1)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontWeight: '500', fontSize: '15px' }}>{question}</span>
        {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
      </button>
      <div style={{ 
        maxHeight: isOpen ? '200px' : '0', overflow: 'hidden', transition: 'all 0.3s ease-in-out',
        background: 'var(--glass-bg)'
      }}>
        <p style={{ padding: '20px', margin: 0, color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>
          {answer}
        </p>
      </div>
    </div>
  );
};

const Support = () => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const faqs = [
    {
      question: "Comment fonctionne une tontine sur la plateforme ?",
      answer: "Une tontine est un groupe d'épargne où chaque membre cotise une somme fixe périodiquement. À chaque tour, l'un des membres reçoit la totalité de la cagnotte. Le cycle continue jusqu'à ce que tout le monde ait été bénéficiaire."
    },
    {
      question: "Comment puis-je inviter des amis à rejoindre ma tontine ?",
      answer: "Dans les détails de votre tontine, cliquez sur 'Inviter'. Vous pouvez soit rechercher un utilisateur déjà inscrit, soit copier le lien d'invitation unique pour l'envoyer par WhatsApp ou SMS."
    },
    {
      question: "Mes informations sont-elles sécurisées ?",
      answer: "Oui, nous utilisons Firebase de Google pour sécuriser vos données et l'authentification. Vos mots de passe sont cryptés et ne sont jamais visibles, même par les administrateurs."
    },
    {
      question: "Que faire si un membre ne paie pas son tour ?",
      answer: "Vous pouvez utiliser le bouton 'Infos' sur le membre concerné pour le 'Signaler'. L'administration recevra une notification et pourra prendre des mesures (avertissement ou bannissement)."
    },
    {
      question: "Comment changer mon mot de passe ?",
      answer: "Rendez-vous sur votre page 'Profil'. Vous y trouverez un champ pour saisir un nouveau mot de passe. Pour des raisons de sécurité, votre mot de passe actuel vous sera demandé pour valider le changement."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      await push(ref(database, 'support'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        message,
        type: 'recommendation',
        status: 'pending',
        timestamp: Date.now()
      });
      setSent(true);
      setMessage('');
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Centre d'aide & Support</h1>
          <p style={{ color: 'var(--text-muted)' }}>Trouvez des réponses ou contactez-nous directement.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start', marginTop: '32px' }}>
        
        {/* FAQ SECTION */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontSize: '20px' }}>
            <HelpCircle size={24} color="var(--primary)" /> Questions Fréquentes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </div>

        {/* CONTACT FORM */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontSize: '20px' }}>
            <MessageSquare size={24} color="var(--primary)" /> Nous écrire
          </h3>
          <div className="glass-panel" style={{ padding: '32px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ display: 'inline-flex', background: 'rgba(46, 204, 113, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
                   <CheckCircle2 size={40} color="#2ecc71" />
                </div>
                <h4 style={{ fontSize: '20px', margin: 0 }}>Message envoyé !</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px', lineHeight: '1.5' }}>L'administration vous répondra dès que possible.</p>
                <button className="btn btn-outline" style={{ marginTop: '24px', width: '100%' }} onClick={() => setSent(false)}>Nouveau message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Votre message</label>
                  <textarea 
                    className="form-input" 
                    rows="6" 
                    placeholder="Suggestion, bug ou question..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    style={{ width: '100%', resize: 'none', lineHeight: '1.6', fontSize: '15px' }}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '24px', width: '100%', display: 'flex', justifyContent: 'center', gap: '10px', padding: '14px' }}>
                  <Send size={18} /> {loading ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
