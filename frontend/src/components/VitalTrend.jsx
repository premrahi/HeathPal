import { useState } from 'react';
import { formatDate, formatTime } from '../lib/format';

const metrics = {
  weight: ['Weight', 'kg'],
  glucose: ['Blood glucose', 'mg/dL'],
  systolic: ['Systolic pressure', 'mmHg'],
  pulse: ['Pulse', 'bpm'],
};
export default function VitalTrend({ items }) {
  const [metric, setMetric] = useState('weight');
  const [label, unit] = metrics[metric];
  const points = items
    .filter((item) => item[metric] != null)
    .sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
  const values = points.map((item) => item[metric]);
  const min = Math.min(...values),
    max = Math.max(...values);
  const range = max - min || Math.max(max * 0.1, 1);
  const coordinates = points.map((point, index) => [
    points.length === 1 ? 300 : 12 + (index / (points.length - 1)) * 576,
    120 - ((point[metric] - min) / range) * 100,
  ]);
  return (
    <>
      <div className="card-header">
        <div>
          <h2>Your recent rhythm</h2>
          <p>Your latest 20 entries. Measurements only, without clinical interpretation.</p>
        </div>
        <label className="trend-select">
          <span className="sr-only">Trend measurement</span>
          <select
            aria-label="Trend measurement"
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
          >
            {Object.entries(metrics).map(([key, [text]]) => (
              <option key={key} value={key}>
                {text}
              </option>
            ))}
          </select>
        </label>
      </div>
      {points.length ? (
        <>
          <div className="chart-meta">
            <span>
              {label} · {unit}
            </span>
            <span>
              {min} – {max} {unit}
            </span>
          </div>
          <svg
            className="chart"
            viewBox="0 0 600 140"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${label} measurements ranging from ${min} to ${max} ${unit}. Exact values are available in the table below.`}
          >
            <line x1="0" y1="20" x2="600" y2="20" />
            <line x1="0" y1="70" x2="600" y2="70" />
            <line x1="0" y1="120" x2="600" y2="120" />
            <polyline points={coordinates.map((point) => point.join(',')).join(' ')} />
            {coordinates.map(([x, y], i) => (
              <circle key={points[i]._id} cx={x} cy={y} r="4">
                <title>
                  {formatTime(points[i].measuredAt)}: {points[i][metric]} {unit}
                </title>
              </circle>
            ))}
          </svg>
          <div className="chart-labels">
            <span>{formatDate(points[0].measuredAt)}</span>
            <span>{formatDate(points.at(-1).measuredAt)}</span>
          </div>
          <details className="trend-table">
            <summary>View exact measurements</summary>
            <div className="table-wrap">
              <table className="data-table">
                <caption className="sr-only">{label} trend data</caption>
                <thead>
                  <tr>
                    <th scope="col">Date & time</th>
                    <th scope="col">
                      {label} ({unit})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point) => (
                    <tr key={point._id}>
                      <td>{formatTime(point.measuredAt)}</td>
                      <td>{point[metric]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <p className="muted small">
          No {label.toLowerCase()} readings yet. Add a measurement in the vitals tracker to start
          your chart.
        </p>
      )}
    </>
  );
}
