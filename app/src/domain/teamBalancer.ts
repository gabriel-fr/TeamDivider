import type { Player, Team } from "./types";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickLowestTotal(candidates: Team[]): Team {
  let target = candidates[0];
  for (const team of candidates) {
    if (
      team.total < target.total ||
      (team.total === target.total && team.players.length < target.players.length)
    ) {
      target = team;
    }
  }
  return target;
}

export function balanceTeams(players: Player[], numTeams: number): Team[] {
  const teams: Team[] = Array.from({ length: numTeams }, () => ({
    players: [],
    total: 0,
    hasGoalkeeper: false,
  }));

  const shuffled = shuffle(players);
  const keepers = shuffled.filter((player) => player.isGoalkeeper).sort((a, b) => b.level - a.level);
  const outfield = shuffled.filter((player) => !player.isGoalkeeper).sort((a, b) => b.level - a.level);
  const leftoverKeepers: Player[] = [];

  for (const goalkeeper of keepers) {
    const candidates = teams.filter((team) => !team.hasGoalkeeper);
    if (candidates.length === 0) {
      leftoverKeepers.push(goalkeeper);
      continue;
    }

    const target = pickLowestTotal(candidates);
    target.players.push(goalkeeper);
    target.total += goalkeeper.level;
    target.hasGoalkeeper = true;
  }

  const remainingPlayers = shuffle([...leftoverKeepers, ...outfield]).sort((a, b) => b.level - a.level);
  for (const player of remainingPlayers) {
    const target = pickLowestTotal(teams);
    target.players.push(player);
    target.total += player.level;
  }

  return teams;
}
