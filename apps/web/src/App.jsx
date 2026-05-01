import { useEffect, useMemo, useState } from 'react';
import { getAlgorithm } from './algorithms.js';
import { fetchDashboardData, runAlgorithmComparison, runSimulationRound, seedDemoData } from './api.js';
import { Comparison } from './components/Comparison.jsx';
import { AlgorithmPicker } from './components/AlgorithmPicker.jsx';
import { HeroShowcase } from './components/HeroShowcase.jsx';
import { MetricCard } from './components/MetricCard.jsx';
import { PlayerTable } from './components/PlayerTable.jsx';
import { RoundHistory } from './components/RoundHistory.jsx';
import { RoundView } from './components/RoundView.jsx';
import { formatNumber, formatPercent } from './format.js';
import { getBestRound } from './rounds.js';

export function App() {
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('hybrid_weighted');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  const latestRound = rounds[0] ?? null;
  const bestRound = useMemo(() => getBestRound(rounds), [rounds]);
  const selected = getAlgorithm(selectedAlgorithm);

  async function refresh() {
    const data = await fetchDashboardData();
    setPlayers(data.players);
    setRounds(data.rounds);
  }

  async function runAction(action, options = {}) {
    setLoading(true);
    setError('');

    try {
      await action();
      if (options.refresh !== false) {
        await refresh();
      }
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSeed() {
    runAction(seedDemoData);
  }

  function handleRunSelected() {
    runAction(() => runSimulationRound(selectedAlgorithm));
  }

  function handleRunAll() {
    runAction(async () => {
      const result = await runAlgorithmComparison();
      setPlayers(result.players);
      setRounds(result.rounds);
    }, { refresh: false });
  }

  useEffect(() => {
    refresh()
      .catch((nextError) => setError(nextError.message))
      .finally(() => setInitialLoading(false));
  }, []);

  return (
    <main className="app-shell">
      <HeroShowcase
        bestRound={bestRound}
        latestRound={latestRound}
        loading={loading}
        onRunAll={handleRunAll}
        onSeed={handleSeed}
        playersCount={players.length}
        selectedAlgorithm={selectedAlgorithm}
      />

      {error ? <div className="alert alert-danger app-alert">{error}</div> : null}

      {initialLoading ? (
        <section className="surface boot-state">
          <div className="loader-line" />
          <h2>Loading simulator data</h2>
          <p>Connecting to the local API and reading players, rounds, and metrics.</p>
        </section>
      ) : null}

      {!initialLoading ? (
        <>
          <section className="control-strip">
            <div className="control-copy">
              <span className="badge rounded-pill" style={{ color: selected.accent, backgroundColor: `${selected.accent}18` }}>{selected.name}</span>
              <strong>{selected.focus}</strong>
              <small>{selected.formula}</small>
            </div>
            <AlgorithmPicker selectedAlgorithm={selectedAlgorithm} onSelect={setSelectedAlgorithm} />
            <button className="btn btn-primary btn-lg run-button" type="button" onClick={handleRunSelected} disabled={loading || players.length < 2}>
              Run selected round
            </button>
          </section>

          {players.length === 0 ? (
            <section className="surface boot-state">
              <h2>No demo players yet</h2>
              <p>Create a repeatable demo pool first. Then run one algorithm or compare all algorithms on the same player set.</p>
              <div className="boot-actions">
                <button className="btn btn-dark" type="button" onClick={handleSeed} disabled={loading}>
                  Create demo pool
                </button>
                <button className="btn btn-outline-secondary" type="button" onClick={handleRunAll} disabled={loading}>
                  Run full comparison
                </button>
              </div>
            </section>
          ) : null}

          <section className="metrics-row">
            <MetricCard label="Players" value={players.length} detail="current demo pool" />
            <MetricCard label="Latest pairs" value={latestRound?.metrics.pairsCount ?? 0} detail={latestRound?.algorithm ?? 'no data'} />
            <MetricCard label="Match rate" value={latestRound ? formatPercent(latestRound.metrics.matchRate) : '0%'} detail="latest round" tone="good" />
            <MetricCard label="Avg ELO delta" value={latestRound ? formatNumber(latestRound.metrics.avgRatingDiff) : '0.00'} detail="lower is better" />
            <MetricCard label="Best quality" value={`${bestRound?.metrics.qualityScore ?? 0}/100`} detail={bestRound?.algorithm ?? 'no data'} tone="hot" />
          </section>

          <section className="workspace-grid">
            <PlayerTable players={players} />
            <RoundView round={latestRound} />
          </section>

          <Comparison rounds={rounds} />
          <RoundHistory rounds={rounds} />
        </>
      ) : null}
    </main>
  );
}
