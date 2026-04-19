import { Match } from '../../domain/entities/match.js';
import { updateElo } from '../../domain/services/elo-calculator.js';
import { toMatchDTO, toPlayerDTO } from '../dto/mappers.js';

export class CompleteMatchCommand {
  constructor(playerRepository, matchRepository, resultResolver) {
    this.playerRepository = playerRepository;
    this.matchRepository = matchRepository;
    this.resultResolver = resultResolver;
  }

  execute(candidate, nowIso, computeTimeMs) {
    const leftPlayer = this.playerRepository.findById(candidate.left.playerId);
    const rightPlayer = this.playerRepository.findById(candidate.right.playerId);

    if (!leftPlayer || !rightPlayer) {
      throw new Error('Unable to complete match for missing player');
    }

    const outcome = this.resultResolver.resolve(leftPlayer.id, rightPlayer.id);
    const leftWon = outcome.winnerPlayerId === leftPlayer.id;
    const leftNewElo = updateElo(leftPlayer.elo, rightPlayer.elo, leftWon ? 1 : 0);
    const rightNewElo = updateElo(rightPlayer.elo, leftPlayer.elo, leftWon ? 0 : 1);

    const updatedLeft = this.playerRepository.update(leftPlayer.recordGame(leftNewElo));
    const updatedRight = this.playerRepository.update(rightPlayer.recordGame(rightNewElo));
    const colors = Math.random() >= 0.5 ? ['white', 'black'] : ['black', 'white'];

    const leftMatch = this.matchRepository.save(new Match({
      id: 0,
      playerId: leftPlayer.id,
      opponentId: rightPlayer.id,
      result: leftWon ? 'win' : 'lose',
      eloBefore: leftPlayer.elo,
      eloAfter: leftNewElo,
      opponentElo: rightPlayer.elo,
      color: colors[0],
      algorithmUsed: candidate.algorithm,
      createdAt: nowIso,
    }));

    this.matchRepository.save(new Match({
      id: 0,
      playerId: rightPlayer.id,
      opponentId: leftPlayer.id,
      result: leftWon ? 'lose' : 'win',
      eloBefore: rightPlayer.elo,
      eloAfter: rightNewElo,
      opponentElo: leftPlayer.elo,
      color: colors[1],
      algorithmUsed: candidate.algorithm,
      createdAt: nowIso,
    }));

    this.matchRepository.recordMetric(candidate.algorithm, candidate.estimatedWaitSeconds, candidate.ratingDiff, computeTimeMs, nowIso);

    return {
      match: toMatchDTO(leftMatch),
      player: toPlayerDTO(updatedLeft),
      opponent: toPlayerDTO(updatedRight),
    };
  }
}
