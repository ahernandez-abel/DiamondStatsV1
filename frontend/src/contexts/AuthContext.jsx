import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { loginRequest } from '../api/auth.api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoadingAuth(false);
  }, []);

  const login = async (credentials) => {
    try {
      const res = await loginRequest(credentials);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setUser(res.data.user);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Error login',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loadingAuth,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}