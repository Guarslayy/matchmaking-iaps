import { toPlayerDTO } from '../dto/mappers.js';

export class RegisterPlayerCommand {
  constructor(playerRepository) {
    this.playerRepository = playerRepository;
  }

  execute(name, nowIso) {
    return toPlayerDTO(this.playerRepository.create(name, nowIso));
  }
}
