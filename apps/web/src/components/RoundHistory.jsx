import { getAlgorithm } from '../algorithms.js';
import { formatNumber } from '../format.js';

export function RoundHistory({ rounds }) {
  return (
    <section className="surface history-surface">
      <header className="surface-header">
        <div>
          <h2>Round history</h2>
          <p>Ratings evolve after each match, so later runs produce different pairings.</p>
        </div>
      </header>

      <div className="history-list">
        {rounds.slice(0, 10).map((round) => {
          const algorithm = getAlgorithm(round.algorithm);

          return (
            <div className="history-row" key={round.id}>
              <span className="algo-dot" style={{ background: algorithm.accent }} />
              <div>
                <strong>{algorithm.name}</strong>
                <small>{round.metrics.pairsCount} pairs / avg delta {formatNumber(round.metrics.avgRatingDiff)} / quality {round.metrics.qualityScore}</small>
              </div>
              <time>{new Date(round.createdAt).toLocaleTimeString()}</time>
            </div>
          );
        })}
      </div>
    </section>
  );
}
