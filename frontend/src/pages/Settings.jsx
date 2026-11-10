import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { PasswordInput } from '../components/AuthLayout';
import { Button, Field, ErrorMessage, PageHeading } from '../components/UI';

export default function Settings() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  async function submit(event) {
    event.preventDefault(); const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    if (body.password !== body.confirmPassword) { setError('The new passwords do not match.'); return; }
    setBusy(true); setError(null);
    try { const data = await api('/auth/change-password', { method: 'POST', body }); form.reset(); toast(data.message); }
    catch (err) { setError(err); } finally { setBusy(false); }
  }
  return <><PageHeading eyebrow="YOUR ACCOUNT" title="A little peace of mind." description="Keep your sign-in details up to date." /><section className="card setting-card"><div className="card-header"><div><h2>Change password</h2><p>Updating your password signs out your other devices.</p></div></div><ErrorMessage error={error} /><form onSubmit={submit}><Field label="Current password" name="currentPassword"><PasswordInput name="currentPassword" minLength={1} /></Field><Field label="New password" name="password" hint="Use at least 10 characters."><PasswordInput autoComplete="new-password" /></Field><Field label="Confirm new password" name="confirmPassword"><PasswordInput name="confirmPassword" autoComplete="new-password" /></Field><div className="form-actions"><Button type="submit" busy={busy}>Update password</Button></div></form></section></>;
}
