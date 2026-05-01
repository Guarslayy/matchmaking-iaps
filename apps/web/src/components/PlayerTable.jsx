export function PlayerTable({ players }) {
  return (
    <section className="surface player-surface">
      <header className="surface-header">
        <div>
          <h2>Player pool</h2>
          <p>Current ELO after completed simulation rounds.</p>
        </div>
        <span className="header-pill">{players.length} players</span>
      </header>

      <div className="player-table">
        {players.map((player, index) => (
          <div className="player-line" key={player.id}>
            <span className="rank-cell">{index + 1}</span>
            <div className="identity-cell">
              <strong>{player.name}</strong>
              <small>{player.gamesPlayed} games played</small>
            </div>
            <div className="rating-cell">
              <span className="elo-cell">{player.elo}</span>
              <div className="rating-track">
                <i style={{ width: `${Math.min(100, Math.max(8, ((player.elo - 900) / 1000) * 100))}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
