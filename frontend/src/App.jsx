import { Component, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, FileText, Sparkles, UserRound, Settings, LogOut, Menu, X, Plus } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Loading, ErrorMessage, Empty, ButtonLink, Button } from './components/UI';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Recovery from './pages/Recovery';
import SettingsPage from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Vitals from './pages/Vitals';

export function Brand() { return <Link to="/" className="brand" aria-label="HealthPal home"><span className="brand-icon"><Plus size={25} /></span>HealthPal<span className="brand-dot">.</span></Link>; }
function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => { document.title = `${pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || 'Your health, together'} | HealthPal`; window.scrollTo(0, 0); document.getElementById('main')?.focus({ preventScroll: true }); }, [pathname]);
  return null;
}
function Protected() {
  const { user, loading, error, refresh } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (error) return <div className="center-card"><ErrorMessage error={error} retry={refresh} /></div>;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
const navigation = [
  ['dashboard', 'Overview', LayoutDashboard], ['reports', 'Medical reports', FileText],
  ['vitals', 'Vitals tracker', Activity], ['insights', 'AI insights', Sparkles],
  ['profile', 'My profile', UserRound], ['settings', 'Account settings', Settings],
];
function Workspace() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  async function signOut() { setBusy(true); try { await logout(); toast('You have been signed out.'); } catch (error) { toast(error.message); } finally { setBusy(false); } }
  return <div className="workspace"><a className="skip-link" href="#main">Skip to content</a>
    <header className="mobile-header"><Brand /><button className="icon-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>
    <aside id="sidebar" className={`sidebar ${open ? 'is-open' : ''}`}><div className="sidebar-brand"><Brand /></div><p className="nav-label">YOUR HEALTH SPACE</p><nav aria-label="Main navigation">{navigation.map(([path, label, Icon]) => <NavLink key={path} to={`/app/${path}`}><Icon size={19} />{label}</NavLink>)}</nav><div className="sidebar-note"><span className="eyebrow">Small steps, every day</span><p>Your health story deserves a little clarity.</p><span>Keep it all together.</span></div><div className="sidebar-user"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div><button className="icon-button" onClick={signOut} disabled={busy} aria-label="Sign out"><LogOut size={18} /></button></div></aside>
    <div className="workspace-main"><header className="workspace-topbar"><span>Your personal health companion</span><span className="privacy-pill">Private workspace</span></header><main id="main" tabIndex={-1} className="content"><Outlet /></main><footer className="workspace-footer">HealthPal · One step toward a clearer health story.</footer></div>
  </div>;
}
function Pending() { return <Empty title="Your health space" description="This module is being connected to your account." />; }
function NotFound() { return <div className="center-card"><Empty title="This page wandered off." description="Let’s get you back to your health space."><ButtonLink to="/">Back home</ButtonLink></Empty></div>; }
class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="center-card"><h1>Something went wrong.</h1><p>Please reload the app to try again.</p><Button onClick={() => window.location.reload()}>Reload app</Button></div> : this.props.children; }
}
export default function App() {
  return <ErrorBoundary><BrowserRouter><ToastProvider><AuthProvider><RouteFocus /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Auth key="login" mode="login" />} />
    <Route path="/signup" element={<Auth key="signup" mode="signup" />} />
    <Route path="/verify-email" element={<Recovery key="verify" mode="verify" />} />
    <Route path="/forgot-password" element={<Recovery key="forgot" mode="forgot" />} />
    <Route path="/reset-password" element={<Recovery key="reset" mode="reset" />} />
    <Route element={<Protected />}><Route path="/app" element={<Workspace />}><Route index element={<Navigate to="dashboard" replace />} />{navigation.map(([path]) => <Route key={path} path={path} element={path === 'settings' ? <SettingsPage /> : path === 'dashboard' ? <Dashboard /> : path === 'profile' ? <Profile /> : path === 'vitals' ? <Vitals /> : <Pending />} />)}<Route path="reports/:id" element={<Pending />} /></Route></Route>
    <Route path="*" element={<NotFound />} />
  </Routes></AuthProvider></ToastProvider></BrowserRouter></ErrorBoundary>;
}
