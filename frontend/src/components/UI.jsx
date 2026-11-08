import { Link } from 'react-router-dom';
import { AlertCircle, FileText, LoaderCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function Button({ children, busy, variant = 'primary', className = '', ...props }) {
  return <button className={`btn btn-${variant} ${className}`} {...props} disabled={busy || props.disabled} aria-busy={busy || undefined}>{busy && <LoaderCircle size={16} className="spin" />}{children}</button>;
}
export function ButtonLink({ children, to, variant = 'primary', ...props }) { return <Link to={to} className={`btn btn-${variant}`} {...props}>{children}</Link>; }
export function Field({ label, name, hint, children, ...props }) {
  return <div className="field"><label htmlFor={name}>{label}</label>{children || <input id={name} name={name} {...props} aria-describedby={hint ? `${name}-hint` : undefined} />}{hint && <small id={`${name}-hint`}>{hint}</small>}</div>;
}
export function ErrorMessage({ error, retry }) {
  if (!error) return null;
  return <div className="error-message" role="alert"><AlertCircle size={18} /><span>{error.message || error}</span>{retry && <button onClick={retry}>Try again</button>}</div>;
}
export function Loading({ label = 'Loading your health space…' }) { return <div className="loading" role="status"><LoaderCircle className="spin" size={24} />{label}</div>; }
export function Empty({ title, description, children, icon: Icon = FileText }) { return <div className="empty"><span className="empty-icon"><Icon size={27} /></span><h2>{title}</h2><p>{description}</p>{children}</div>; }
export function PageHeading({ eyebrow, title, description, children }) { return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div><div className="heading-actions">{children}</div></div>; }
export function Pagination({ page, pages, onChange }) {
  if (pages < 2) return null;
  return <nav className="pagination" aria-label="Page navigation"><Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} />Previous</Button><span>Page {page} of {pages}</span><Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next<ChevronRight size={16} /></Button></nav>;
}
export function StatusBadge({ status }) { return <span className={`status-badge status-${status}`}>{({ uploaded: 'Uploaded', analyzing: 'Analyzing', ready: 'Analyzed', failed: 'Analysis failed', not_medical: 'Not recognized' })[status] || status}</span>; }
export function MedicalNote() { return <p className="medical-note">AI explanations may contain mistakes and are for information only. Review the original report and discuss questions with a qualified clinician.</p>; }
