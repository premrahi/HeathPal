import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const timer = useRef();
  const toast = useCallback(text => { clearTimeout(timer.current); setMessage(text); timer.current = setTimeout(() => setMessage(''), 5000); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <ToastContext.Provider value={toast}>{children}<div className="toast-region" role="status">{message && <div className="toast">{message}<button onClick={() => setMessage('')} aria-label="Dismiss notification">×</button></div>}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
