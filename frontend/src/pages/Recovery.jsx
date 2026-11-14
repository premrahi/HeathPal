import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useResource } from '../hooks/useResource';
import { AuthLayout, PasswordInput } from '../components/AuthLayout';
import { Button, Field, ErrorMessage } from '../components/UI';

export default function Recovery({ mode }) {
  const verify = mode === 'verify';
  const forgot = mode === 'forgot';
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimer = useRef();
  useEffect(() => () => clearTimeout(cooldownTimer.current), []);
  const { data: health } = useResource('/health');
  const { setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const data = await api(
        `/auth/${verify ? 'verify-email' : forgot ? 'forgot-password' : 'reset-password'}`,
        { method: 'POST', body },
      );
      if (verify) {
        setUser(data.user);
        toast('Email verified. Welcome to HealthPal.');
        navigate('/app/dashboard', { replace: true });
      } else if (forgot) {
        toast(data.message);
        navigate('/reset-password', { state: { email } });
      } else {
        toast(data.message);
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setResending(true);
    setError(null);
    try {
      const data = await api(`/auth/${verify ? 'resend-verification' : 'forgot-password'}`, {
        method: 'POST',
        body: { email },
      });
      toast(data.message);
      setSent(true);
      setCooldown(true);
      cooldownTimer.current = setTimeout(() => setCooldown(false), 60000);
    } catch (err) {
      setError(err);
    } finally {
      setResending(false);
    }
  }
  return (
    <AuthLayout>
      <p className="eyebrow">{verify ? 'ONE QUICK CHECK' : 'LET’S GET YOU BACK IN'}</p>
      <h1>{verify ? 'Check your inbox.' : forgot ? 'Forgot your password?' : 'A fresh start.'}</h1>
      <p className="auth-intro">
        {verify
          ? 'Enter the 6-digit code sent to your email. Codes expire in 10 minutes.'
          : forgot
            ? 'Enter your account email and we’ll send a reset code.'
            : 'Enter your reset code and choose a new password.'}
      </p>
      {health?.developmentMail && (
        <div className="dev-note">
          Local development: email codes appear in the backend terminal instead of an inbox.
        </div>
      )}
      <ErrorMessage error={error} />
      <form onSubmit={submit}>
        <Field
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {!forgot && (
          <Field
            label="6-digit code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            minLength={6}
            maxLength={6}
            required
            placeholder="000000"
          />
        )}
        {!verify && !forgot && (
          <Field label="New password" name="password" hint="Use at least 10 characters.">
            <PasswordInput autoComplete="new-password" />
          </Field>
        )}
        <Button className="btn-wide" type="submit" busy={busy}>
          {verify ? 'Verify email' : forgot ? 'Send reset code' : 'Reset password'}
        </Button>
      </form>
      {!forgot && (
        <div className="auth-bottom">
          <Button variant="ghost" busy={resending} disabled={cooldown || !email} onClick={resend}>
            {cooldown
              ? 'Wait a minute before resending'
              : sent
                ? 'Resend code again'
                : 'Send a new code'}
          </Button>
        </div>
      )}
      <p className="auth-bottom">
        <Link className="text-link" to="/login">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
