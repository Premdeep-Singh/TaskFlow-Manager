import { createContext, useContext, useState } from 'react';
import { api, token } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('th_user')); } catch { return null; }
  });

  const save = (res) => {
    token.set(res.token);
    localStorage.setItem('th_user', JSON.stringify(res.user));
    setUser(res.user);
  };
  const login = async (email, password) => save(await api.post('/auth/login', { email, password }));
  const register = async (name, email, password) => save(await api.post('/auth/register', { name, email, password }));
  const logout = () => {
    token.clear();
    localStorage.removeItem('th_user');
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}
