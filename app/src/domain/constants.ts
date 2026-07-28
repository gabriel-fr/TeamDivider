import type { Jersey, Level, LevelInfo } from "./types";

export const LEVELS: LevelInfo[] = [
  { value: 1, label: "Joga mal", short: "Mal" },
  { value: 2, label: "Joga medio", short: "Medio" },
  { value: 3, label: "Joga bem", short: "Bem" },
  { value: 4, label: "Joga muito bem", short: "Muito bem" },
];

export const JERSEYS: Jersey[] = [
  { name: "Coral", accent: "#FF6B4A", bg: "rgba(255,107,74,0.12)" },
  { name: "Azul", accent: "#4A9EFF", bg: "rgba(74,158,255,0.12)" },
  { name: "Violeta", accent: "#B98CFF", bg: "rgba(185,140,255,0.12)" },
  { name: "Verde-limao", accent: "#B4E23D", bg: "rgba(180,226,61,0.12)" },
];

export function levelInfo(value: Level): LevelInfo {
  return LEVELS.find((level) => level.value === value) as LevelInfo;
}
