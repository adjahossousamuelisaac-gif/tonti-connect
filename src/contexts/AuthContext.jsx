import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, database, ref, set, remove, get } from '../config/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  setPersistence,
  browserSessionPersistence,
  deleteUser
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email, password, nom, prenom, telephone) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const defaultUsername = (prenom || nom || 'user').split(' ')[0].toLowerCase() + Math.floor(Math.random() * 10000);
    
    // Enregistrement dans la Realtime DB de Firebase
    await set(ref(database, 'utilisateurs/' + user.uid), {
      email: user.email,
      nom: nom,
      prenom: prenom || '',
      telephone: telephone || '',
      username: defaultUsername,
      role: 'user', // Par défaut simple utilisateur lors de l'inscription
      dateInscription: Date.now()
    });
    
    return userCredential;
  }

  function logout() {
    return signOut(auth);
  }

  async function deleteAccount() {
    if (currentUser) {
      await remove(ref(database, 'utilisateurs/' + currentUser.uid));
      await deleteUser(currentUser);
    }
  }

  useEffect(() => {
    // Forcer la persistance session au démarrage
    setPersistence(auth, browserSessionPersistence).catch(err => console.error(err));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snapshot = await get(ref(database, 'utilisateurs/' + user.uid));
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.statut === 'banni') {
              setUserData(null);
              setCurrentUser(null);
              signOut(auth);
              alert("Votre compte a été banni par l'administrateur.");
            } else {
              setUserData(data);
            }
          } else {
            setUserData(null);
          }
        } catch (err) {
          console.error("Error fetching user data in AuthContext:", err);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    register,
    logout,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}