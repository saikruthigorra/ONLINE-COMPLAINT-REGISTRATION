import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('cms_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('cms_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('cms_user', JSON.stringify(data.user));
      } catch (error) {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('cms_token', data.token);
    localStorage.setItem('cms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('cms_token', data.token);
    localStorage.setItem('cms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, isAuthenticated: Boolean(user) }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
