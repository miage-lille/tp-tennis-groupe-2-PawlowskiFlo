import { Player, stringToPlayer, isSamePlayer } from './types/player';
import { Point, PointsData, Score, FortyData, points, deuce, forty, advantage, game, love, fifteen, thirty } from './types/score';
import { pipe, Option } from 'effect'

// -------- Tooling functions --------- //

export const playerToString = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};
export const otherPlayer = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return stringToPlayer('PLAYER_TWO');
    case 'PLAYER_TWO':
      return stringToPlayer('PLAYER_ONE');
  }
};
// Exercice 1 :
export const pointToString = (point: Point): string => {
  switch (point.kind) {
    case 'LOVE':
      return 'Love';
    case 'FIFTEEN':
      return '15';
    case 'THIRTY':
      return '30';
    default:
      throw new Error(`Invalid point: ${point}`);
  }
};

export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'POINTS':
      const p1Points = pointToString(score.pointsData.PLAYER_ONE);
      const p2Points = pointToString(score.pointsData.PLAYER_TWO);
      return `${p1Points} - ${p2Points}`;
    case 'FORTY':
      const fortyPlayer = playerToString(score.fortyData.player);
      const otherPoints = pointToString(score.fortyData.otherPoint);
      return `${fortyPlayer}: 40 - Other: ${otherPoints}`;
    case 'DEUCE':
      return 'Deuce';
    case 'ADVANTAGE':
      const advantagePlayer = playerToString(score.player);
      return `Advantage ${advantagePlayer}`;
    case 'GAME':
      const gameWinner = playerToString(score.player);
      return `Game ${gameWinner}`;
    default:
      throw new Error('Unknown score type');
  }
};

export const scoreWhenDeuce = (winner: Player): Score => {
  return advantage(winner);
};

export const scoreWhenAdvantage = (
  advantagedPlayed: Player,
  winner: Player
): Score => {
  if (isSamePlayer(advantagedPlayed, winner)) return game(winner);
  return deuce();
};

export const incrementPoint = (point: Point): Option.Option<Point> => {
  switch (point.kind) {
    case 'LOVE':
      return Option.some(fifteen());
    case 'FIFTEEN':
      return Option.some(thirty());
    case 'THIRTY':
      return Option.none();
  }
};

export const scoreWhenForty = (
  currentForty: FortyData,
  winner: Player
): Score => {
  if (isSamePlayer(currentForty.player, winner)) return game(winner);
  return pipe(
    incrementPoint(currentForty.otherPoint),
    Option.match({
      onNone: () => deuce(),
      onSome: p => forty(currentForty.player, p) as Score
    })
  );
};



// Exercice 2
// Tip: You can use pipe function from Effect to improve readability.
// See scoreWhenForty function above.
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  const winnerPoint = winner === 'PLAYER_ONE' ? current.PLAYER_ONE : current.PLAYER_TWO;
  const otherPlayer = winner === 'PLAYER_ONE' ? 'PLAYER_TWO' : 'PLAYER_ONE';
  const otherPoint = winner === 'PLAYER_ONE' ? current.PLAYER_TWO : current.PLAYER_ONE;
  
  return pipe(
    incrementPoint(winnerPoint),
    Option.match({
      onNone: () => forty(winner, otherPoint),
      onSome: (newPoint) => {
        const newPointsData: PointsData = winner === 'PLAYER_ONE' 
          ? { PLAYER_ONE: newPoint, PLAYER_TWO: otherPoint }
          : { PLAYER_ONE: otherPoint, PLAYER_TWO: newPoint };
        return points(newPointsData.PLAYER_ONE, newPointsData.PLAYER_TWO);
      }
    })
  );
};

// Exercice 3
export const scoreWhenGame = (winner: Player): Score => {
  // When score is Game, a player has already won - the game doesn't change
  return game(winner);
};

export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);
    case 'DEUCE':
      return scoreWhenDeuce(winner);
    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);
    case 'GAME':
      return scoreWhenGame(currentScore.player);
    default:
      throw new Error('Unknown score type');
  }
};

// Initialize a new game
export const newGame: Score = points(love(), love());
