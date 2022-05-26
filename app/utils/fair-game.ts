export default function fairGameGenerator(players: []) {
  const middle = Math.floor(players.length / 2);
  const sortedPlayers = players.sort();
  const bestPlayers = sortedPlayers.slice(0, middle);
  const worstPlayers = sortedPlayers
    .slice(middle + 1, players.length)
    .reverse();
  let teamA: any = [];
  let teamB: any = [];

  for (let i = 0; i < bestPlayers.length; i++) {
    if (i % 2 === 0) {
      teamA.push(bestPlayers[i]);
    } else {
      teamB.push(bestPlayers[i]);
    }
  }

  for (let i = 0; i < worstPlayers.length; i++) {
    if (i % 2 === 0) {
      teamA.push(worstPlayers[i]);
    } else {
      teamB.push(worstPlayers[i]);
    }
  }

  return [teamA, teamB];
}
