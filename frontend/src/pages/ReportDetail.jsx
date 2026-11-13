import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { formatBytes, formatDate, formatTime } from '../lib/format';
import { useResource } from '../hooks/useResource';
import { useToast } from '../context/ToastContext';
import { Button, PageHeading, ErrorMessage, Loading, StatusBadge, MedicalNote } from '../components/UI';
import Explanation from '../components/Explanation';

export default function ReportDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useResource(`/reports/${id}`);
  const { data: health } = useResource('/health');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const status = data?.report.status;
  useEffect(() => { if (status === 'analyzing') { const timer = setInterval(reload, 5000); return () => clearInterval(timer); } }, [status, reload]);
  async function analyze() {
    setBusy(true); setActionError(null);
    try { await api(`/reports/${id}/analyze`, { method: 'POST', body: { consent } }); toast('Analysis complete. Review it alongside the original report.'); setConsent(false); reload(); }
    catch (err) { setActionError(err); reload(); } finally { setBusy(false); }
  }
  async function remove() {
    setDeleteBusy(true); setActionError(null);
    try { const result = await api(`/reports/${id}`, { method: 'DELETE' }); toast(result.message); navigate('/app/reports', { replace: true }); }
    catch (err) { setActionError(err); } finally { setDeleteBusy(false); }
  }
  if (loading) return <Loading />;
  if (error) return <><Link className="text-link" to="/app/reports">← Back to reports</Link><ErrorMessage error={error} retry={reload} /></>;
  const { report } = data;
  return <><Link className="text-link" to="/app/reports"><ArrowLeft size={13} /> Back to reports</Link><div style={{ marginTop: 24 }}><PageHeading eyebrow={report.category.toUpperCase()} title={report.title} description={`Added ${formatDate(report.createdAt)}${report.reportDate ? ` · Report date ${formatDate(report.reportDate)}` : ''}`}><Button variant="danger" disabled={busy || deleteBusy} onClick={() => setDeleting(true)}><Trash2 size={15} />Delete report</Button></PageHeading></div><ErrorMessage error={actionError} />{deleting && <div className="confirm-box" role="alert"><p>Delete this report, its file, and its AI explanation? This cannot be undone.</p><div className="confirm-actions"><Button variant="danger" busy={deleteBusy} onClick={remove}>Delete permanently</Button><Button variant="secondary" disabled={deleteBusy} onClick={() => setDeleting(false)}>Keep report</Button></div></div>}
    <div className="stack"><section className="card"><div className="card-header"><h2>Original report</h2><StatusBadge status={report.status} /></div><div className="file-details"><FileText size={29} /><div><strong>{report.filename}</strong><p>{report.mimeType === 'application/pdf' ? 'PDF document' : 'Image'} · {formatBytes(report.size)}</p></div><a className="btn btn-secondary" href={`/api/reports/${id}/file`} download><Download size={16} />Download original</a></div></section>
    <section className="card"><div className="card-header"><div><h2>Understand the details</h2><p>{report.analyzedAt ? `Last analyzed ${formatTime(report.analyzedAt)}` : 'An optional second look, in simpler language.'}</p></div><span className="icon-tile"><Sparkles size={21} /></span></div>{report.status === 'ready' && report.analysis?.summary ? <Explanation analysis={report.analysis} /> : <><p className="small muted">Request a summary, explanations in English and Roman Urdu, and questions you can take to your clinician.</p><MedicalNote /></>}{report.analysisError && <div className="notice">{report.analysisError}</div>}{(busy || status === 'analyzing') ? <Loading label="Reading your report. This can take up to a minute…" /> : <>{health && !health.aiEnabled ? <div className="notice">AI analysis is not configured on this server. You can still save and download reports. The administrator can enable it with a Gemini API key.</div> : <><label className="consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />I agree to send this report to Google Gemini for AI analysis. The file may contain personal medical information.</label><Button busy={busy} disabled={!consent || !health?.aiEnabled} onClick={analyze}><Sparkles size={16} />{report.status === 'ready' ? 'Analyze again' : 'Explain this report'}</Button></>}</>}</section></div>
  </>;
}
