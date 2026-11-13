import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useResource } from '../hooks/useResource';
import { formatDate } from '../lib/format';
import { PageHeading, Empty, Loading, ErrorMessage, ButtonLink, Pagination, MedicalNote } from '../components/UI';

export default function Insights() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource(`/dashboard/insights?page=${page}&limit=6`);
  return <><PageHeading eyebrow="A CLEARER PERSPECTIVE" title="Your AI insights." description="Revisit the explanations you’ve requested, in one place." />{loading ? <Loading /> : error ? <ErrorMessage error={error} retry={reload} /> : !data.items.length ? <section className="card"><Empty icon={Sparkles} title="A little more understanding." description="Upload a report, then choose to generate an AI explanation from its detail page."><ButtonLink to="/app/reports">Go to your reports</ButtonLink></Empty></section> : <><div className="insights-grid">{data.items.map(report => <article className="card insight-card" key={report._id}><div className="detail-header"><span className="icon-tile"><Sparkles size={21} /></span><span className="small muted">{formatDate(report.analyzedAt)}</span></div><h2>{report.title}</h2><p>{report.analysis.summary}</p><div className="notice">Explanations in English & Roman Urdu</div><Link to={`/app/reports/${report._id}`} className="text-link">Read the full explanation <ArrowUpRight size={14} /></Link></article>)}</div><Pagination page={page} pages={data.pages} onChange={setPage} /><MedicalNote /></>}</>;
}
