import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database, ref, update, push } from '../config/firebase';
import { useTontines } from '../hooks/useTontines';
import { useMembres } from '../hooks/useMembres';
import { useUsers } from '../hooks/useUsers';
import { usePaiements } from '../hooks/usePaiements';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, UserPlus, Trash2, Phone, Users, Search, Copy, Check, Mail, X, Activity, Wallet, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

const TontineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tontines } = useTontines();
  const { membres, demandes, invitations, loading, addMembre, deleteMembre, inviteUser, accepterInvitation, refuserInvitation } = useMembres(id);
  const { searchUsers } = useUsers();
  
  const tontine = tontines.find(t => t.id === id);
  
  const sortedMembres = useMemo(() => {
    return [...membres].sort((a, b) => (a.numeroTour || 0) - (b.numeroTour || 0));
  }, [membres]);
  
  const handleCycleComplet = async (prochainCycle) => {
    const tontineRef = ref(database, `tontines/${id}`);
    await update(tontineRef, { cycleActuel: prochainCycle });
  };

  const { paiements, demanderPaiement, confirmerPaiement, enregistrerPaiement, aPaye, estEnAttente } = usePaiements(
    id, 
    tontine?.cycleActuel || 1, 
    sortedMembres.map(m => m.id), 
    tontine?.montant || 0, 
    membres.length,
    handleCycleComplet
  );

  const beneficiaryId = useMemo(() => {
    if (!membres.length || !tontine) return null;
    const sortedMembres = [...membres].sort((a, b) => a.numeroTour - b.numeroTour);
    const index = ((tontine.cycleActuel || 1) - 1) % sortedMembres.length;
    return sortedMembres[index];
  }, [membres, tontine?.cycleActuel]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Info Modal state
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [reportModal, setReportModal] = useState(null); // { user, reason }
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const myMemberInfo = membres.find(m => m.userId === currentUser?.uid);
  const isAccepted = myMemberInfo?.statut === 'accepte';
  const isInvited = myMemberInfo?.statut === 'invite';
  const isPendingRequest = myMemberInfo?.statut === 'demande';
  const isOrganizer = tontine?.createurId === currentUser?.uid;

  const searchResults = useMemo(() => {
    return searchUsers(searchQuery);
  }, [searchQuery, searchUsers]);

  if (!tontine) return <div style={{ padding: '40px' }}>Chargement...</div>;

  // VERIFICATION DES ACCÈS
  if (!isOrganizer && !isAccepted) {
    return (
      <div className="animate-fade" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <AlertCircle size={48} color="var(--primary)" style={{ marginBottom: '24px' }} />
          <h2>Accès restreint</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '16px', marginBottom: '32px' }}>
            {isInvited 
              ? "Vous avez été invité à cette tontine. Vous devez accepter l'invitation pour voir les détails." 
              : isPendingRequest 
                ? "Votre demande d'adhésion est en cours d'examen par l'organisateur."
                : "Vous n'avez pas accès à cette tontine."}
          </p>
          
          {isInvited && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-success" onClick={() => accepterInvitation(myMemberInfo.id)}>Accepter l'invitation</button>
              <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => refuserInvitation(myMemberInfo.id)}>Refuser</button>
            </div>
          )}
          
          <button className="btn btn-outline" style={{ marginTop: '24px' }} onClick={() => navigate('/tontines')}>
            Retour aux tontines
          </button>
        </div>
      </div>
    );
  }

  const iHavePaid = myMemberInfo ? aPaye(myMemberInfo.id, tontine?.cycleActuel || 1) : false;
  const iAmPending = myMemberInfo ? estEnAttente(myMemberInfo.id, tontine?.cycleActuel || 1) : false;

  const handleInviter = async (e) => {
    e.preventDefault();
    await addMembre({ nom, telephone });
    setIsModalOpen(false);
    setNom('');
    setTelephone('');
  };

  const handleInvitePlatformUser = async (user) => {
    const result = await inviteUser(user);
    if (result.success) {
      setSearchQuery('');
    } else {
      alert(result.error);
    }
  };

  const handleMyPayment = async () => {
    if (!myMemberInfo) return;
    if (isOrganizer) {
      await enregistrerPaiement(myMemberInfo.id, tontine.cycleActuel || 1, tontine.montant);
    } else {
      await demanderPaiement(myMemberInfo.id, tontine.cycleActuel || 1, tontine.montant);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(link);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason || !reportModal) return;
    setReporting(true);
    try {
      await push(ref(database, 'support'), {
        type: 'user_report',
        reporterId: currentUser.uid,
        reporterEmail: currentUser.email,
        reportedUserId: reportModal.userId || reportModal.id,
        reportedUserName: reportModal.nom,
        reason: reportReason,
        tontineId: id,
        status: 'pending',
        timestamp: Date.now()
      });
      setReportModal(null);
      setReportReason('');
      alert("Signalement envoyé à l'administration.");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi du signalement.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <button className="btn btn-outline" style={{ border: 'none', padding: 0, marginBottom: '16px', color: 'var(--primary)' }} onClick={() => navigate('/tontines')}>
            <ArrowLeft size={18} /> Retour aux tontines
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
             <h1 className="page-title">{tontine.nom}</h1>
             <span style={{ fontSize: '12px', background: 'var(--glass-bg)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>ID: {id}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '18px' }}>Cotisation : <strong style={{ color: 'var(--text-main)' }}>{tontine.montant.toLocaleString()} FCFA</strong> / {tontine.frequence}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%', marginTop: '16px' }}>
          {myMemberInfo && !iHavePaid && !iAmPending && (
            <button className="btn btn-success" onClick={handleMyPayment} style={{ background: '#2ecc71', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', flex: '1' }}>
              <Wallet size={20} /> Payer ma part
            </button>
          )}
          {iAmPending && (
            <span className="badge warning" style={{ padding: '10px 16px', flex: '1', justifyContent: 'center' }}>En attente...</span>
          )}
          {iHavePaid && (
            <span className="badge success" style={{ padding: '10px 16px', flex: '1', justifyContent: 'center' }}>Cycle payé !</span>
          )}
          
          {isOrganizer && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ flex: '1' }}>
              <UserPlus size={20} /> Inviter
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
         {/* INFO CYCLE */}
         <div className="glass-panel" style={{ padding: '24px', background: 'rgba(155, 81, 224, 0.05)', border: '1px solid var(--primary-light)' }}>
            <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Cycle Actuel</h4>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>N° {tontine.cycleActuel || 1}</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Sur {membres.length} cycles prévus</p>
         </div>

         {/* BENEFICIAIRE */}
         <div className="glass-panel" style={{ padding: '24px', background: 'rgba(46, 204, 113, 0.05)', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
            <h4 style={{ margin: 0, color: '#2ecc71', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bénéficiaire du tour</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0' }}>{beneficiaryId?.nom || 'En attente...'}</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Recevra : <strong style={{ color: 'var(--text-main)' }}>{(tontine.montant * membres.length).toLocaleString()} FCFA</strong></p>
         </div>
      </div>

      {/* DEMANDES D'ADHÉSION EN ATTENTE (POUR L'ORGANISATEUR) */}
      {isOrganizer && demandes.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
            <Users size={20} color="var(--primary)" /> Demandes d'adhésion ({demandes.length})
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {demandes.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--glass-bg)', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '500' }}>{req.nom}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{req.email || 'Utilisateur plateforme'}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => accepterInvitation(req.id)}>Approuver</button>
                   <button className="btn btn-icon" onClick={() => refuserInvitation(req.id)}><X size={18} color="var(--danger)"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVITATIONS ENVOYÉES (POUR L'ORGANISATEUR) */}
      {isOrganizer && invitations.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.8 }}>
          <h4 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>Invitations en attente de réponse</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
             {invitations.map(inv => (
               <span key={inv.id} style={{ background: 'var(--glass-bg)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {inv.nom}
                  <button onClick={() => refuserInvitation(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={12} color="var(--danger)"/></button>
               </span>
             ))}
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '24px' }}>
         <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
               <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                     <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Membre</th>
                     <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Statut</th>
                     <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {sortedMembres.map(m => {
                    const paye = aPaye(m.id, tontine.cycleActuel || 1);
                    const attente = estEnAttente(m.id, tontine.cycleActuel || 1);
                    const isMe = m.userId === currentUser?.uid;
                    const isOrganizer = tontine.createurId === currentUser?.uid;

                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '500' }}>{m.nom}</span> 
                            {isMe && <span className="badge" style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px' }}>Moi</span>}
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          {paye ? (
                            <span className="badge success">Payé</span>
                          ) : attente ? (
                            <span className="badge warning">En attente</span>
                          ) : (
                            <span className="badge danger">Non payé</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn btn-icon" style={{ width: '32px', height: '32px', padding: 0 }} title="Voir les infos" onClick={() => setSelectedUserInfo(m)}>
                              <Info size={16} />
                            </button>
                            {isOrganizer ? (
                            <>
                              {/* Pour les membres hors plateforme, l'organisateur enregistre directement */}
                              {!m.userId && !paye && (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} 
                                  onClick={() => enregistrerPaiement(m.id, tontine.cycleActuel || 1, tontine.montant)}>
                                   Enregistrer
                                </button>
                              )}
                              
                              {/* Pour les membres plateforme, l'organisateur attend la demande et confirme */}
                              {m.userId && attente && (
                                <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px', background: '#2ecc71', border: 'none' }} 
                                  onClick={() => {
                                    const p = paiements.find(p => p.membreId === m.id && p.cycle === (tontine.cycleActuel || 1) && p.statut === 'en_attente');
                                    if (p) confirmerPaiement(p.id);
                                  }}>
                                   Confirmer
                                </button>
                              )}
                              
                              {/* Cas particulier : l'organisateur peut aussi enregistrer pour lui-même s'il est membre */}
                              {isMe && !paye && !attente && (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} 
                                  onClick={() => enregistrerPaiement(m.id, tontine.cycleActuel || 1, tontine.montant)}>
                                   Enregistrer ma part
                                </button>
                              )}
                            </>
                          ) : (
                            isMe && !paye && !attente && (
                              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => demanderPaiement(m.id, tontine.cycleActuel || 1, tontine.montant)}>
                                 Marquer comme payé
                              </button>
                            )
                          )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      <React.Fragment>
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="glass-panel modal-content animate-fade" style={{ padding: '32px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', margin: 0 }}>Inviter des membres</h2>
                <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>

              {/* RECHERCHE PLATEFORME */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Rechercher un utilisateur sur la plateforme</label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" className="input-field" style={{ paddingLeft: '40px' }}
                    placeholder="Rechercher par @username..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                {searchQuery && (
                  <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '200px', overflowY: 'auto' }}>
                    {searchResults.length === 0 ? (
                      <p style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Aucun utilisateur trouvé.</p>
                    ) : (
                      searchResults.map(u => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{u.nom} <span style={{ color: 'var(--primary)', fontSize: '12px', marginLeft: '6px' }}>@{u.username}</span></p>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setSelectedUserInfo(u)}>
                              Infos
                            </button>
                            <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleInvitePlatformUser(u)}>
                              Ajouter
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '24px 0' }}></div>

              {/* LIEN D'INVITATION */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Lien d'invitation direct</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" className="input-field" readOnly
                    value={`${window.location.origin}/join/${id}`}
                    style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                  />
                  <button className="btn btn-outline" onClick={copyLink} title="Copier le lien" style={{ flexShrink: 0 }}>
                    {copied ? <Check size={18} color="#2ecc71" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '24px 0' }}></div>

              {/* AJOUT MANUEL */}
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Ajout manuel</h3>
              <form onSubmit={handleInviter}>
                <div className="input-group">
                  <label>Nom complet</label>
                  <input 
                    type="text" className="input-field" required
                    value={nom} onChange={e => setNom(e.target.value)}
                    placeholder="Ex: Aminata Diallo"
                  />
                </div>
                <div className="input-group" style={{ marginBottom: '24px' }}>
                  <label>Téléphone (Optionnel) </label>
                  <input 
                    type="tel" className="input-field"
                    value={telephone} onChange={e => setTelephone(e.target.value)}
                    placeholder="Ex: 0707070707"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>Ajouter au groupe</button>
              </form>
            </div>
          </div>
        )}

        {selectedUserInfo && (
          <div className="modal-overlay">
            <div className="glass-panel modal-content animate-fade" style={{ padding: '32px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', margin: 0 }}><Info size={24} color="var(--primary)"/> Informations</h2>
                <button className="btn btn-icon" onClick={() => setSelectedUserInfo(null)}><X size={20}/></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nom complet</label>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '500', fontSize: '16px' }}>
                    {selectedUserInfo.prenom ? `${selectedUserInfo.prenom} ` : ''}{selectedUserInfo.nom}
                  </p>
                </div>
                {selectedUserInfo.username && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nom d'utilisateur</label>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--primary)', fontWeight: '600' }}>@{selectedUserInfo.username}</p>
                  </div>
                )}
                {selectedUserInfo.email && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</label>
                    <p style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14}/> {selectedUserInfo.email}</p>
                  </div>
                )}
                {selectedUserInfo.telephone && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Téléphone</label>
                    <p style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14}/> {selectedUserInfo.telephone}</p>
                  </div>
                )}
                {!selectedUserInfo.userId && !selectedUserInfo.email && !selectedUserInfo.username && (
                  <p style={{ fontSize: '13px', color: 'var(--warning)', marginTop: '8px', padding: '8px', background: 'rgba(242, 201, 76, 0.1)', borderRadius: '8px' }}>Membre manuel (hors plateforme)</p>
                )}

                {selectedUserInfo.userId && selectedUserInfo.userId !== currentUser.uid && (
                  <button 
                    className="btn btn-outline" 
                    style={{ marginTop: '16px', color: '#eb5757', borderColor: 'rgba(235, 87, 87, 0.3)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    onClick={() => {
                      setReportModal(selectedUserInfo);
                      setSelectedUserInfo(null);
                    }}
                  >
                    <ShieldAlert size={18} /> Signaler cet utilisateur
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {reportModal && (
          <div className="modal-overlay">
            <div className="glass-panel modal-content animate-fade" style={{ padding: '32px', border: '1px solid rgba(235, 87, 87, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', color: '#eb5757', margin: 0 }}><AlertTriangle size={24}/> Signaler</h2>
                <button className="btn btn-icon" onClick={() => setReportModal(null)}><X size={20}/></button>
              </div>
              
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
                Vous signalez <strong>{reportModal.nom}</strong> pour comportement malveillant ou non respect des règles.
              </p>

              <form onSubmit={handleReport}>
                <div className="input-group">
                  <label>Raison du signalement</label>
                  <textarea 
                    className="input-field" 
                    required 
                    rows="4" 
                    placeholder="Expliquez pourquoi vous signalez cet utilisateur..."
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    style={{ resize: 'none', padding: '12px' }}
                  />
                </div>
                <button disabled={reporting} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', background: '#eb5757', border: 'none', marginTop: '20px', color: 'white' }}>
                  {reporting ? 'Envoi...' : 'Envoyer le signalement'}
                </button>
              </form>
            </div>
          </div>
        )}
      </React.Fragment>
    </div>
  );
};

export default TontineDetails;
