export type Level = 1 | 2 | 3 | 4;

export interface LevelInfo {
  value: Level;
  label: string;
  short: string;
}

export interface Player {
  id: string;
  name: string;
  level: Level;
  isGoalkeeper: boolean;
}

export interface Team {
  players: Player[];
  total: number;
  hasGoalkeeper: boolean;
}

export interface Jersey {
  name: string;
  accent: string;
  bg: string;
}

export interface ParsedPlayer {
  id: string;
  name: string;
  level: Level;
  matched: boolean;
  isGoalkeeper: boolean;
}
