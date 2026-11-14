import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthLayout, PasswordInput } from '../components/AuthLayout';
import { Button, Field, ErrorMessage } from '../components/UI';

export default function Auth({ mode }) {
  const signup = mode === 'signup';
  const { user, setUser } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  if (user) return <Navigate to="/app/dashboard" replace />;
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const data = await api(`/auth/${signup ? 'signup' : 'login'}`, { method: 'POST', body });
      if (signup) {
        toast(data.message);
        navigate('/verify-email', { state: { email: data.email } });
      } else {
        setUser(data.user);
        const from = location.state?.from;
        navigate(typeof from === 'string' && from.startsWith('/app/') ? from : '/app/dashboard', {
          replace: true,
        });
      }
    } catch (err) {
      if (err.data?.verificationRequired)
        navigate('/verify-email', { state: { email: err.data.email } });
      else setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout>
      <p className="eyebrow">{signup ? 'START YOUR STORY' : 'GOOD TO SEE YOU AGAIN'}</p>
      <h1>{signup ? 'A healthier kind of organized.' : 'Welcome back.'}</h1>
      <p className="auth-intro">
        {signup
          ? 'Create your account and give your health details a home.'
          : 'Sign in to pick up where you left off.'}
      </p>
      <ErrorMessage error={error} />
      <form onSubmit={submit}>
        {signup && (
          <Field
            label="Full name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Your full name"
          />
        )}
        <Field
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          name="password"
          hint={signup ? 'Use at least 10 characters.' : undefined}
        >
          <PasswordInput
            autoComplete={signup ? 'new-password' : 'current-password'}
            minLength={signup ? 10 : 1}
          />
        </Field>
        {!signup && (
          <div className="auth-link-row">
            <Link className="text-link" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
        )}
        <Button className="btn-wide" busy={busy} type="submit">
          {signup ? 'Create account' : 'Sign in'}
          <ArrowRight size={17} />
        </Button>
      </form>
      <p className="auth-bottom">
        {signup ? 'Already have an account?' : 'New here?'}{' '}
        <Link className="text-link" to={signup ? '/login' : '/signup'}>
          {signup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
      {signup && (
        <p className="auth-bottom small">We’ll send a code to verify your email address.</p>
      )}
    </AuthLayout>
  );
}
