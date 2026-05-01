import { algorithms } from '../algorithms.js';
import { formatNumber, formatPercent } from '../format.js';

export function HeroShowcase({
  bestRound,
  latestRound,
  loading,
  onRunAll,
  onSeed,
  playersCount,
  selectedAlgorithm,
}) {
  const selected = algorithms.find((algorithm) => algorithm.id === selectedAlgorithm) ?? algorithms[0];

  return (
    <section className="hero-showcase">
      <div className="hero-content">
        <span className="product-kicker">IAPS project / live simulator</span>
        <h1>Matchmaking Arena</h1>
        <p>
          Run a full player pool through different pairing strategies, watch ELO move after every match,
          and compare algorithm quality with readable metrics.
        </p>

        <div className="hero-actions">
          <button className="btn btn-warning btn-lg shadow-sm" type="button" onClick={onRunAll} disabled={loading}>
            Run all algorithms
          </button>
          <button className="btn btn-light btn-lg shadow-sm" type="button" onClick={onSeed} disabled={loading}>
            Reset demo pool
          </button>
        </div>
      </div>

      <aside className="arena-card">
        <div className="arena-card-header">
          <div>
            <span className="badge rounded-pill text-bg-dark">Live round</span>
            <h2>{selected.name}</h2>
          </div>
          <strong>{bestRound?.metrics.qualityScore ?? 0}</strong>
        </div>

        <div className="arena-board">
          <div className="arena-player arena-player-a">
            <span>Ariana</span>
            <strong>1029</strong>
          </div>
          <div className="arena-player arena-player-b">
            <span>Oleg</span>
            <strong>1809</strong>
          </div>
          <div className="arena-link" />
          <div className="arena-center">
            <span>VS</span>
          </div>
        </div>

        <div className="hero-stat-row">
          <div>
            <span>Players</span>
            <strong>{playersCount}</strong>
          </div>
          <div>
            <span>Match rate</span>
            <strong>{latestRound ? formatPercent(latestRound.metrics.matchRate) : '0%'}</strong>
          </div>
          <div>
            <span>Avg ELO delta</span>
            <strong>{latestRound ? formatNumber(latestRound.metrics.avgRatingDiff) : '0.00'}</strong>
          </div>
        </div>
      </aside>
    </section>
  );
}
