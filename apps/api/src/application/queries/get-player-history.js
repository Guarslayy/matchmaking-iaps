import { toMatchDTO } from '../dto/mappers.js';

export class GetPlayerHistoryQuery {
  constructor(matchRepository) {
    this.matchRepository = matchRepository;
  }

  execute(playerId) {
    return this.matchRepository.findByPlayerId(playerId).map(toMatchDTO);
  }
}
