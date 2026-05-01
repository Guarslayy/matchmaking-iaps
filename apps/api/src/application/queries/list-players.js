import { toPlayerDTO } from '../dto/mappers.js';

export class ListPlayersQuery {
  constructor(playerRepository) {
    this.playerRepository = playerRepository;
  }

  execute() {
    return this.playerRepository.findAll().map(toPlayerDTO);
  }
}
