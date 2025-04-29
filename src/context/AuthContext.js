// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Checking localStorage for user');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('AuthContext: Found stored user:', parsedUser);
      getUserProfile(parsedUser.userId)
        .then((profile) => {
          console.log('AuthContext: Fetched profile from Firestore:', profile);
          const updatedUser = {
            ...parsedUser,
            isActive: profile.isActive,
            name: profile.name,
            phone: profile.phone,
            email: profile.email,
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('AuthContext: Updated user state:', updatedUser);
        })
        .catch((error) => {
          console.error('AuthContext: Error syncing user profile:', error);
          setUser(parsedUser); // Fallback to stored user
        })
        .finally(() => {
          setLoading(false);
          console.log('AuthContext: Initial loading complete');
        });
    } else {
      setLoading(false);
      console.log('AuthContext: No stored user, loading complete');
    }
  }, []);

  const login = async (userData) => {
    try {
      console.log('AuthContext: Logging in user:', userData);
      const profile = await getUserProfile(userData.userId);
      console.log('AuthContext: Fetched profile for login:', profile);
      const updatedUser = {
        ...userData,
        isActive: profile.isActive,
        name: profile.name || userData.name,
        phone: profile.phone || userData.phone,
        email: profile.email || userData.email,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('AuthContext: Login successful, user set:', updatedUser);
    } catch (error) {
      console.error('AuthContext: Error during login:', error);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('AuthContext: Fallback login, user set:', userData);
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
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