import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, FileText, Plus, Search, UploadCloud } from 'lucide-react';
import { api } from '../lib/api';
import { formatBytes, formatDate } from '../lib/format';
import { useResource } from '../hooks/useResource';
import { useToast } from '../context/ToastContext';
import {
  Button,
  Field,
  PageHeading,
  StatusBadge,
  ErrorMessage,
  Empty,
  Loading,
  Pagination,
} from '../components/UI';

export default function Reports() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const query = params.get('search') || '';
  const [search, setSearch] = useState(query);
  const [showUpload, setShowUpload] = useState(params.get('upload') === '1');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { data, loading, error, reload } = useResource(
    `/reports?page=${page}&limit=9&search=${encodeURIComponent(query)}`,
  );
  const formRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();
  useEffect(() => {
    setSearch(query);
  }, [query]);
  useEffect(() => {
    if (showUpload) formRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [showUpload]);
  function chooseFile(event) {
    const selected = event.target.files[0];
    setFile(selected || null);
    setUploadError(null);
    if (selected && !title) setTitle(selected.name.replace(/\.[^.]+$/, '').slice(0, 120));
  }
  async function upload(event) {
    event.preventDefault();
    setUploadError(null);
    if (!file) {
      setUploadError('Choose a report file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Choose a file smaller than 10 MB.');
      return;
    }
    setBusy(true);
    try {
      const result = await api('/reports', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
      toast(result.message);
      navigate(`/app/reports/${result.report._id}`);
    } catch (err) {
      setUploadError(err);
    } finally {
      setBusy(false);
    }
  }
  function changePage(next) {
    setParams({ ...(query ? { search: query } : {}), page: String(next) });
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR HEALTH STORY, ORGANIZED"
        title="Medical reports."
        description="A private home for the details you want to keep."
      >
        <Button onClick={() => setShowUpload(true)}>
          <Plus size={16} />
          Upload report
        </Button>
      </PageHeading>
      {showUpload && (
        <section className="card upload-card" ref={formRef} style={{ scrollMarginTop: 95 }}>
          <div className="card-header">
            <div>
              <h2>Add a medical report</h2>
              <p>Files stay private. AI analysis is a separate choice after upload.</p>
            </div>
            <Button variant="ghost" disabled={busy} onClick={() => setShowUpload(false)}>
              Cancel
            </Button>
          </div>
          <ErrorMessage error={uploadError} />
          <form onSubmit={upload}>
            <div className="upload-layout">
              <label className="file-drop" htmlFor="report-file">
                <UploadCloud size={31} />
                <span>{file ? file.name : 'Choose your report'}</span>
                <small>
                  {file ? formatBytes(file.size) : 'PDF, PNG, JPEG, WebP · up to 10 MB'}
                </small>
                <input
                  id="report-file"
                  name="file"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={chooseFile}
                  required
                />
              </label>
              <div>
                <Field
                  label="Report title"
                  name="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={120}
                  placeholder="e.g. Annual blood test"
                />
                <div className="form-grid">
                  <Field label="Category" name="category">
                    <select id="category" name="category" defaultValue="Laboratory">
                      {['Laboratory', 'Imaging', 'Prescription', 'Other'].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Report date (optional)" name="reportDate" type="date" />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <Button type="submit" busy={busy}>
                <UploadCloud size={16} />
                Save report
              </Button>
            </div>
          </form>
        </section>
      )}
      <div className="toolbar">
        <form
          className="search-form"
          onSubmit={(event) => {
            event.preventDefault();
            setParams(search.trim() ? { search: search.trim() } : {});
          }}
        >
          <label className="sr-only" htmlFor="report-search">
            Search reports by title
          </label>
          <input
            className="search-input"
            id="report-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxLength={100}
            placeholder="Search your reports…"
          />
          <Button type="submit" variant="secondary" aria-label="Search reports">
            <Search size={17} />
          </Button>
          {query && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setSearch('');
                setParams({});
              }}
            >
              Clear
            </Button>
          )}
        </form>
        <span className="small muted">
          {data ? `${data.total} ${data.total === 1 ? 'report' : 'reports'}` : ''}
        </span>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage error={error} retry={reload} />
      ) : data.items.length ? (
        <>
          <div className="report-grid">
            {data.items.map((report) => (
              <article key={report._id} className="card report-card">
                <div className="report-card-top">
                  <span className="icon-tile">
                    <FileText size={23} />
                  </span>
                  <StatusBadge status={report.status} />
                </div>
                <h2>
                  <Link to={`/app/reports/${report._id}`}>{report.title}</Link>
                </h2>
                <div className="report-meta">
                  <span>{report.category}</span>
                  <span>·</span>
                  <span>{formatDate(report.reportDate || report.createdAt)}</span>
                </div>
                <p className="report-summary">
                  {report.analysis?.summary ||
                    'Your report is saved. Open it to download the file or request an AI explanation.'}
                </p>
                <div className="report-card-bottom">
                  <span>{formatBytes(report.size)}</span>
                  <Link className="text-link" to={`/app/reports/${report._id}`}>
                    View report <ArrowUpRight size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Pagination page={page} pages={data.pages} onChange={changePage} />
        </>
      ) : (
        <section className="card">
          <Empty
            title={query ? 'No matching reports.' : 'A home for your health details.'}
            description={
              query
                ? 'Try another title or clear your search.'
                : 'Upload a medical report to keep it organized and close at hand.'
            }
          >
            {!query && (
              <Button variant="secondary" onClick={() => setShowUpload(true)}>
                Upload your first report
              </Button>
            )}
          </Empty>
        </section>
      )}
    </>
  );
}
