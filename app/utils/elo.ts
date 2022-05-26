type Team = {
  isWinner: boolean;
  teamScore: number[];
};

type Player = {
  elo: number;
  isWinner: boolean;
};

const K_FACTOR = 15;

const getExpected = (playerAScore: number, playerBScore: number) =>
  1 / (1 + Math.pow(10, (playerBScore - playerAScore) / 400));

const getRating = (expected: number, isWinner: boolean) => {
  return Math.round(K_FACTOR * ((isWinner ? 1 : 0) - expected));
};

const getMedian = (score: Team['teamScore']) =>
  score.reduce((acc, cur) => acc + cur, 0) / score.length;

export const getElo = (playerA: Player, playerB: Player) => {
  const playerAExpected = getExpected(playerA.elo, playerB.elo);
  const playerBExpected = getExpected(playerB.elo, playerA.elo);
  const aNewRating = getRating(playerAExpected, playerA.isWinner);
  const bNewRating = getRating(playerBExpected, playerB.isWinner);

  return { aNewRating, bNewRating };
};

export const getTeamElo = (teamA: Team, teamB: Team) => {
  return getElo(
    { elo: getMedian(teamA.teamScore), isWinner: teamA.isWinner },
    { elo: getMedian(teamB.teamScore), isWinner: teamB.isWinner }
  );
};
