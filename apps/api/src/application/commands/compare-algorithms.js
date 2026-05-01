import { algorithmTypes } from '../../../../../packages/shared/src/types.js';

function defaultOptionsFor(algorithm) {
  if (algorithm !== 'hybrid_weighted') {
    return {};
  }

  return { alpha: 0.7, beta: 0.3 };
}

export class CompareAlgorithmsCommand {
  constructor(seedDemoData, runSimulationRound, listPlayers) {
    this.seedDemoData = seedDemoData;
    this.runSimulationRound = runSimulationRound;
    this.listPlayers = listPlayers;
  }

  execute(nowIso = new Date().toISOString(), seedTimeMs = Date.now()) {
    const rounds = algorithmTypes.map((algorithm) => {
      this.seedDemoData.execute(seedTimeMs);
      return this.runSimulationRound.execute(algorithm, nowIso, defaultOptionsFor(algorithm));
    });

    return {
      rounds,
      players: this.listPlayers.execute(),
    };
  }
}
