import { algorithms } from '../algorithms.js';
import { clampPercent, formatNumber } from '../format.js';
import { latestRoundByAlgorithm } from '../rounds.js';

function Bar({ value, max = 100, accent, inverse = false }) {
  const raw = clampPercent((value / (max || 1)) * 100);
  const width = inverse ? clampPercent(100 - raw) : raw;

  return (
    <div className="metric-bar">
      <span style={{ width: `${width}%`, background: accent }} />
    </div>
  );
}

export function Comparison({ rounds }) {
  const roundMap = latestRoundByAlgorithm(rounds);
  const entries = algorithms.map((algorithm) => ({
    ...algorithm,
    round: roundMap.get(algorithm.id),
  }));
  const maxRatingDiff = Math.max(...entries.map((entry) => entry.round?.metrics.avgRatingDiff ?? 0), 1);
  const maxCompute = Math.max(...entries.map((entry) => entry.round?.metrics.avgComputeTimeMs ?? 0), 1);

  return (
    <section className="surface comparison-surface">
      <header className="surface-header">
        <div>
          <h2>Algorithm comparison</h2>
          <p>Concrete metrics for the report: coverage, rating quality, wait time, and compute cost.</p>
        </div>
      </header>

      <div className="comparison-grid">
        {entries.map((entry) => {
          const metrics = entry.round?.metrics;

          return (
            <article className="algorithm-result" key={entry.id} style={{ '--accent': entry.accent }}>
              <div className="algorithm-result-head">
                <div>
                  <strong>{entry.name}</strong>
                  <small>{entry.formula}</small>
                </div>
                <span>{metrics?.qualityScore ?? 0}</span>
              </div>

              <div className="result-lines">
                <div>
                  <label>Match rate</label>
                  <Bar value={(metrics?.matchRate ?? 0) * 100} accent={entry.accent} />
                  <em>{Math.round((metrics?.matchRate ?? 0) * 100)}%</em>
                </div>
                <div>
                  <label>Avg ELO delta</label>
                  <Bar value={metrics?.avgRatingDiff ?? 0} max={maxRatingDiff} accent={entry.accent} inverse />
                  <em>{formatNumber(metrics?.avgRatingDiff ?? 0)}</em>
                </div>
                <div>
                  <label>Avg compute</label>
                  <Bar value={metrics?.avgComputeTimeMs ?? 0} max={maxCompute} accent={entry.accent} inverse />
                  <em>{formatNumber(metrics?.avgComputeTimeMs ?? 0, 4)}ms</em>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
