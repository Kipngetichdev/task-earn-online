// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage and sync with Firestore
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Fetch isActive from Firestore to ensure consistency
      getUserProfile(parsedUser.userId)
        .then((profile) => {
          const updatedUser = {
            ...parsedUser,
            isActive: profile.isActive,
            name: profile.name,
            phone: profile.phone,
            email: profile.email,
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        })
        .catch((error) => {
          console.error('Error syncing user profile:', error);
          setUser(parsedUser); // Fallback to stored user
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (userData) => {
    try {
      // Fetch user profile from Firestore to get isActive
      const profile = await getUserProfile(userData.userId);
      const updatedUser = {
        ...userData,
        isActive: profile.isActive,
        name: profile.name || userData.name,
        phone: profile.phone || userData.phone,
        email: profile.email || userData.email,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error during login:', error);
      // Fallback to userData if Firestore fails
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);