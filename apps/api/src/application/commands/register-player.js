import { toPlayerDTO } from '../dto/mappers.js';

export class RegisterPlayerCommand {
  constructor(playerRepository) {
    this.playerRepository = playerRepository;
  }

  execute(name, nowIso, initialElo = 1200) {
    return toPlayerDTO(this.playerRepository.create(name, nowIso, initialElo));
  }
}
