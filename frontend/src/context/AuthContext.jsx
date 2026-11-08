import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { const data = await api('/auth/me'); setUser(data.user); }
    catch (err) { setUser(null); if (err.status !== 401) setError(err); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const invalidate = () => setUser(null);
    window.addEventListener('healthpal:unauthorized', invalidate);
    return () => window.removeEventListener('healthpal:unauthorized', invalidate);
  }, []);
  async function logout() { await api('/auth/logout', { method: 'POST' }); setUser(null); }
  return <AuthContext.Provider value={{ user, setUser, loading, error, refresh, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
