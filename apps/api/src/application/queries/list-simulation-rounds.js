export class ListSimulationRoundsQuery {
  constructor(matchRepository) {
    this.matchRepository = matchRepository;
  }

  execute(limit = 12) {
    return this.matchRepository.listSimulationRounds(limit);
  }
}
