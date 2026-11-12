import { useEffect, useRef, useState } from 'react';
import { Activity, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { formatTime, localDateTime } from '../lib/format';
import { useResource } from '../hooks/useResource';
import { useToast } from '../context/ToastContext';
import { Button, Field, ErrorMessage, Loading, PageHeading, Empty, Pagination } from '../components/UI';

export default function Vitals() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource(`/vitals?page=${page}&limit=10`);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const toast = useToast();
  const formRef = useRef();
  useEffect(() => { if (showForm) { formRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); formRef.current?.querySelector('input')?.focus(); } }, [showForm, editing]);
  function openForm(item = null) { setEditing(item); setFormError(null); setShowForm(true); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setFormError(null);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const body = { note: values.note, measuredAt: new Date(values.measuredAt).toISOString() };
    for (const key of ['systolic', 'diastolic', 'glucose', 'weight', 'pulse']) body[key] = values[key] === '' ? null : Number(values[key]);
    try { const result = await api(`/vitals${editing ? `/${editing._id}` : ''}`, { method: editing ? 'PUT' : 'POST', body }); toast(result.message); setShowForm(false); setEditing(null); if (page !== 1) setPage(1); else reload(); }
    catch (err) { setFormError(err); } finally { setBusy(false); }
  }
  async function remove() {
    setDeleteBusy(true); setFormError(null);
    try { const result = await api(`/vitals/${deleting._id}`, { method: 'DELETE' }); toast(result.message); setDeleting(null); if (data.items.length === 1 && page > 1) setPage(page - 1); else reload(); }
    catch (err) { toast(err.message); } finally { setDeleteBusy(false); }
  }
  return <><PageHeading eyebrow="SMALL STEPS, RECORDED" title="Your everyday vitals." description="Keep a record of your measurements, one check-in at a time."><Button onClick={() => openForm()}><Plus size={16} />Record a measurement</Button></PageHeading>{showForm && <section className="card" ref={formRef} style={{ marginBottom: 25, scrollMarginTop: 95 }}><div className="card-header"><h2>{editing ? 'Edit measurement' : 'A little check-in'}</h2><Button variant="ghost" onClick={() => setShowForm(false)} disabled={busy}>Cancel</Button></div><ErrorMessage error={formError} /><form key={editing?._id || 'new'} onSubmit={save}><div className="form-grid"><Field label="Systolic pressure (mmHg)" name="systolic" type="number" min={30} max={300} step="1" defaultValue={editing?.systolic ?? ''} placeholder="e.g. 120" /><Field label="Diastolic pressure (mmHg)" name="diastolic" type="number" min={20} max={250} step="1" defaultValue={editing?.diastolic ?? ''} placeholder="e.g. 80" /><Field label="Blood glucose (mg/dL)" name="glucose" type="number" min={10} max={1000} step="0.1" defaultValue={editing?.glucose ?? ''} placeholder="Enter your reading" /><Field label="Weight (kg)" name="weight" type="number" min={1} max={700} step="0.1" defaultValue={editing?.weight ?? ''} placeholder="Enter your weight" /><Field label="Pulse (bpm)" name="pulse" type="number" min={10} max={300} step="1" defaultValue={editing?.pulse ?? ''} placeholder="Enter your reading" /><Field label="Date & time" name="measuredAt" type="datetime-local" required max={localDateTime()} defaultValue={localDateTime(editing?.measuredAt || new Date())} /></div><Field label="A note (optional)" name="note"><textarea id="note" name="note" maxLength={1000} defaultValue={editing?.note || ''} placeholder="Before breakfast, after a walk, or anything you want to remember…" /></Field><p className="small muted">Enter at least one measurement. Blood pressure requires both numbers. Use the units shown above.</p><div className="form-actions"><Button type="submit" busy={busy}>{editing ? 'Save changes' : 'Save measurement'}</Button></div></form></section>}
    {deleting && <div className="confirm-box" role="alert"><p>Delete the entry from {formatTime(deleting.measuredAt)}? This cannot be undone.</p><div className="confirm-actions"><Button variant="danger" busy={deleteBusy} onClick={remove}>Delete measurement</Button><Button variant="secondary" disabled={deleteBusy} onClick={() => setDeleting(null)}>Keep entry</Button></div></div>}
    <section className="card"><div className="card-header"><div><h2>Your measurement journal</h2><p>{data ? `${data.total} entries recorded` : 'Your personal measurement history'}</p></div><Activity size={21} /></div>{loading ? <Loading /> : error ? <ErrorMessage error={error} retry={reload} /> : data.items.length ? <><div className="table-wrap"><table className="data-table"><caption className="sr-only">Your recorded vital measurements</caption><thead><tr>{['Date & time', 'BP (mmHg)', 'Glucose (mg/dL)', 'Weight (kg)', 'Pulse (bpm)', 'Note', 'Actions'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{data.items.map(item => <tr key={item._id}><td>{formatTime(item.measuredAt)}</td><td>{item.systolic == null ? '—' : `${item.systolic}/${item.diastolic}`}</td><td>{item.glucose ?? '—'}</td><td>{item.weight ?? '—'}</td><td>{item.pulse ?? '—'}</td><td className="note-cell">{item.note || '—'}</td><td><div className="row-actions"><button className="icon-button" onClick={() => openForm(item)} aria-label={`Edit entry from ${formatTime(item.measuredAt)}`}><Pencil size={15} /></button><button className="icon-button" onClick={() => setDeleting(item)} aria-label={`Delete entry from ${formatTime(item.measuredAt)}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div><Pagination page={page} pages={data.pages} onChange={setPage} /></> : <Empty icon={Activity} title="Every entry is a small step." description="Record your first measurement to begin your journal."><Button variant="secondary" onClick={() => openForm()}>Add a measurement</Button></Empty>}</section><p className="medical-note">These are your recorded values, not a medical assessment. Review your measurements with your healthcare professional.</p>
  </>;
}
