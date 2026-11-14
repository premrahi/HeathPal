import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, FileText, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { formatDate, formatTime } from '../lib/format';
import {
  PageHeading,
  ButtonLink,
  ErrorMessage,
  Loading,
  Empty,
  StatusBadge,
} from '../components/UI';
import VitalTrend from '../components/VitalTrend';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useResource('/dashboard');
  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} retry={reload} />;
  const vital = data.latestVital;
  return (
    <>
      <PageHeading
        eyebrow="YOUR HEALTH, IN VIEW"
        title={`Welcome, ${user.name.split(' ')[0]}.`}
        description="A little check-in with your health story."
      >
        <ButtonLink to="/app/reports?upload=1">
          <Plus size={16} />
          Upload report
        </ButtonLink>
      </PageHeading>
      <div className="stat-grid">
        {[
          [FileText, 'Medical reports', data.reportCount, 'Privately organized'],
          [Activity, 'Vitals entries', data.vitalCount, 'Small steps, recorded'],
          [Sparkles, 'AI explanations', data.analyzedCount, 'A clearer perspective'],
        ].map(([Icon, title, count, note]) => (
          <div className="stat-card" key={title}>
            <div>
              <small>{title}</small>
              <strong>{count}</strong>
              <p>{note}</p>
            </div>
            <span className="icon-tile">
              <Icon size={21} />
            </span>
          </div>
        ))}
      </div>
      <div className="two-columns">
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Your recent reports</h2>
              <p>The latest additions to your health story.</p>
            </div>
            <Link className="text-link" to="/app/reports">
              View all ↗
            </Link>
          </div>
          {data.recentReports.length ? (
            data.recentReports.map((report) => (
              <Link to={`/app/reports/${report._id}`} className="record-row" key={report._id}>
                <span className="icon-tile">
                  <FileText size={19} />
                </span>
                <div className="record-info">
                  <strong>{report.title}</strong>
                  <small>
                    {report.category} · {formatDate(report.reportDate || report.createdAt)}
                  </small>
                </div>
                <StatusBadge status={report.status} />
                <ArrowUpRight size={16} />
              </Link>
            ))
          ) : (
            <Empty
              title="Your story starts here."
              description="Upload your first report to keep it close at hand."
            >
              <ButtonLink to="/app/reports?upload=1" variant="secondary">
                Add your first report
              </ButtonLink>
            </Empty>
          )}
        </section>
        <section className="card">
          <div className="card-header">
            <div>
              <h2>A recent snapshot</h2>
              <p>
                {vital
                  ? formatTime(vital.measuredAt)
                  : 'Your latest vitals entry will appear here.'}
              </p>
            </div>
            <Activity size={20} />
          </div>
          {vital ? (
            <>
              <div className="vital-snapshot">
                {[
                  [
                    'Blood pressure',
                    vital.systolic == null ? '—' : `${vital.systolic}/${vital.diastolic}`,
                    'mmHg',
                  ],
                  ['Blood glucose', vital.glucose ?? '—', 'mg/dL'],
                  ['Weight', vital.weight ?? '—', 'kg'],
                  ['Pulse', vital.pulse ?? '—', 'bpm'],
                ].map(([label, value, unit]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>
                      {value}
                      <span>{unit}</span>
                    </strong>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <Link className="text-link" to="/app/vitals">
                  Go to vitals tracker ↗
                </Link>
              </div>
            </>
          ) : (
            <Empty
              icon={Activity}
              title="Make a little note."
              description="Start recording the measurements you want to keep track of."
            >
              <ButtonLink to="/app/vitals" variant="secondary">
                Record a measurement
              </ButtonLink>
            </Empty>
          )}
        </section>
      </div>
      <section className="card" style={{ marginTop: 24 }}>
        <VitalTrend items={data.trend} />
      </section>
    </>
  );
}
