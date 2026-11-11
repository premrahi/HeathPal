import { useState } from 'react';
import { UserRound, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import { Field, Button, PageHeading, ErrorMessage } from '../components/UI';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [photo, setPhoto] = useState(null);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(null);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const { name, ...profile } = values;
    try { const data = await api('/profile', { method: 'PUT', body: { name, profile } }); setUser(data.user); toast(data.message); }
    catch (err) { setError(err); } finally { setBusy(false); }
  }
  async function changePhoto(remove = false) {
    if (!remove && !photo) return;
    if (!remove && photo.size > 512 * 1024) { setPhotoError('Choose a photo smaller than 512 KB.'); return; }
    setPhotoBusy(true); setPhotoError(null);
    const body = new FormData(); if (photo) body.append('file', photo);
    try { const data = await api('/profile/avatar', { method: remove ? 'DELETE' : 'PUT', ...(remove ? {} : { body }) }); setUser(data.user); setPhoto(null); toast(data.message); }
    catch (err) { setPhotoError(err); } finally { setPhotoBusy(false); }
  }
  return <><PageHeading eyebrow="THE PERSON BEHIND THE NUMBERS" title="Your health profile." description="A few details to make this space your own." /><div className="profile-layout"><section className="card"><div className="profile-header">{user.avatarUpdatedAt ? <img className="avatar" src={`/api/profile/avatar?v=${encodeURIComponent(user.avatarUpdatedAt)}`} alt="Your profile" /> : <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>}<div><h2>{user.name}</h2><p>{user.email}</p></div></div><ErrorMessage error={error} /><form onSubmit={submit}><h3 className="profile-section-title">The basics</h3><div className="form-grid"><Field label="Full name" name="name" defaultValue={user.name} required minLength={2} maxLength={100} autoComplete="name" /><Field label="Phone number" name="phone" type="tel" defaultValue={user.profile?.phone} maxLength={30} autoComplete="tel" /><Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={user.profile?.dateOfBirth} max={new Date().toISOString().slice(0, 10)} /><Field label="Gender" name="gender"><select id="gender" name="gender" defaultValue={user.profile?.gender || ''}><option value="">Choose an option</option>{['Female', 'Male', 'Other', 'Prefer not to say'].map(value => <option key={value}>{value}</option>)}</select></Field><Field label="Country" name="country" defaultValue={user.profile?.country} maxLength={100} autoComplete="country-name" /><Field label="City" name="city" defaultValue={user.profile?.city} maxLength={100} autoComplete="address-level2" /></div><hr className="divider" /><h3 className="profile-section-title">A few health details</h3><Field label="Blood group" name="bloodGroup"><select id="bloodGroup" name="bloodGroup" defaultValue={user.profile?.bloodGroup || ''}><option value="">Not provided</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(value => <option key={value}>{value}</option>)}</select></Field><Field label="Allergies" name="allergies"><textarea id="allergies" name="allergies" maxLength={1000} defaultValue={user.profile?.allergies} placeholder="Anything you want to remember" /></Field><Field label="Existing conditions" name="conditions"><textarea id="conditions" name="conditions" maxLength={1000} defaultValue={user.profile?.conditions} placeholder="Add any relevant health notes" /></Field><div className="form-actions"><Button busy={busy} type="submit"><Save size={16} />Save profile</Button></div></form></section><aside className="stack"><section className="card profile-side"><span className="icon-tile"><UserRound size={23} /></span><h2 style={{ marginTop: 20 }}>Your space, your details.</h2><p>Your profile helps you keep your own information organized. Only your signed-in account can access it.</p><dl><div><dt>Email</dt><dd>Verified</dd></div><div><dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd></div></dl></section><section className="card"><h3>Profile photo</h3><ErrorMessage error={photoError} /><div className="avatar-upload"><label htmlFor="photo">PNG, JPEG, or WebP · up to 512 KB</label><input id="photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { setPhoto(event.target.files[0]); setPhotoError(null); }} /><div className="form-actions">{user.avatarUpdatedAt && <Button variant="ghost" busy={photoBusy} onClick={() => changePhoto(true)}>Remove</Button>}<Button busy={photoBusy} disabled={!photo} onClick={() => changePhoto()}>Upload photo</Button></div></div></section></aside></div></>;
}
