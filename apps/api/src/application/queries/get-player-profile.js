import { toPlayerDTO } from '../dto/mappers.js';

export class GetPlayerProfileQuery {
  constructor(playerRepository) {
    this.playerRepository = playerRepository;
  }

  execute(playerId) {
    const player = this.playerRepository.findById(playerId);
    return player ? toPlayerDTO(player) : null;
  }
}
