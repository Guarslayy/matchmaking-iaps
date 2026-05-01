import { getAlgorithm } from '../algorithms.js';
import { eloDelta, formatNumber } from '../format.js';

function MatchCard({ pair, index }) {
  const playerWon = pair.winnerId === pair.player.after.id;
  const opponentWon = pair.winnerId === pair.opponent.after.id;

  return (
    <article className="pair-card">
      <div className="pair-card-top">
        <span>Pair {index + 1}</span>
        <strong>Delta ELO {pair.ratingDiff}</strong>
      </div>

      <div className="pair-fighters">
        <div className={`fighter-card ${playerWon ? 'winner' : ''}`}>
          {playerWon ? <span className="winner-badge badge rounded-pill text-bg-success">Winner</span> : null}
          <strong>{pair.player.after.name}</strong>
          <span>{pair.player.before.elo} to {pair.player.after.elo}</span>
          <em>{eloDelta(pair.player.before.elo, pair.player.after.elo)}</em>
        </div>
        <div className="versus-mark">VS</div>
        <div className={`fighter-card ${opponentWon ? 'winner' : ''}`}>
          {opponentWon ? <span className="winner-badge badge rounded-pill text-bg-success">Winner</span> : null}
          <strong>{pair.opponent.after.name}</strong>
          <span>{pair.opponent.before.elo} to {pair.opponent.after.elo}</span>
          <em>{eloDelta(pair.opponent.before.elo, pair.opponent.after.elo)}</em>
        </div>
      </div>

      <div className="pair-card-bottom">
        <span>wait {pair.waitTimeSeconds}s</span>
        <span>{formatNumber(pair.computeTimeMs, 4)}ms</span>
        {pair.debug ? <span>score {formatNumber(pair.debug.finalScore, 3)}</span> : null}
      </div>
    </article>
  );
}

export function RoundView({ round }) {
  if (!round) {
    return (
      <section className="surface empty-round">
        <h2>No round yet</h2>
        <p>Seed the demo pool or run all algorithms to generate matches, ELO changes, and comparison data.</p>
      </section>
    );
  }

  const algorithm = getAlgorithm(round.algorithm);

  return (
    <section className="surface">
      <header className="surface-header">
        <div>
          <h2>Latest round</h2>
          <p>
            <span className="algo-dot" style={{ background: algorithm.accent }} />
            {algorithm.name} on {new Date(round.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="quality-badge">{round.metrics.qualityScore}/100</div>
      </header>

      <div className="round-metrics">
        <span>{round.metrics.pairsCount} pairs</span>
        <span>{Math.round(round.metrics.matchRate * 100)}% matched</span>
        <span>avg delta {formatNumber(round.metrics.avgRatingDiff)}</span>
        <span>{formatNumber(round.metrics.avgComputeTimeMs, 4)}ms avg</span>
      </div>

      <div className="pair-grid">
        {round.pairs.map((pair, index) => (
          <MatchCard pair={pair} index={index} key={`${round.id}-${pair.player.after.id}-${pair.opponent.after.id}`} />
        ))}
      </div>
    </section>
  );
}
