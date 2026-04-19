export class GetMetricsQuery {
  constructor(matchRepository) {
    this.matchRepository = matchRepository;
  }

  execute(algorithm) {
    return this.matchRepository.getMetrics(algorithm);
  }
}
