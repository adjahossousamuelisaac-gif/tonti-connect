import { useState, useEffect } from 'react';
import { database, ref, get } from '../config/firebase';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(database, 'utilisateurs');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const usersList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setUsers(usersList);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const searchUsers = (query) => {
    if (!query) return [];
    let lowerQuery = query.toLowerCase();
    if (lowerQuery.startsWith('@')) {
       lowerQuery = lowerQuery.substring(1);
    }
    return users.filter(u => 
      u.username?.toLowerCase().includes(lowerQuery) || 
      u.nom?.toLowerCase().includes(lowerQuery) || 
      u.email?.toLowerCase().includes(lowerQuery)
    );
  };

  return { users, loading, searchUsers };
}
