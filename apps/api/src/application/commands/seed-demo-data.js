export const demoPlayers = [
  ['Ariana', 1010],
  ['Bogdan', 1080],
  ['Cristina', 1160],
  ['Dumitru', 1230],
  ['Elena', 1290],
  ['Felix', 1360],
  ['Gina', 1430],
  ['Henry', 1510],
  ['Irina', 1580],
  ['Victor', 1660],
  ['Nadia', 1740],
  ['Oleg', 1840],
];

export class SeedDemoDataCommand {
  constructor(registerPlayer, resetStore) {
    this.registerPlayer = registerPlayer;
    this.resetStore = resetStore;
  }

  execute(seedTimeMs = Date.now()) {
    this.resetStore();

    const players = demoPlayers.map(([name, elo], index) => {
      const createdAt = new Date(seedTimeMs - (demoPlayers.length - index) * 3600000).toISOString();
      return this.registerPlayer.execute(name, createdAt, elo);
    });

    return { players };
  }
}
