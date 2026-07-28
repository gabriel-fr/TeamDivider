import type { Level, ParsedPlayer } from "./types";

const LEVEL_PATTERNS: { level: Level; regex: RegExp }[] = [
  { level: 4, regex: /\bmuito\s*bem\b|\bmuito\s*boa?\b/i },
  { level: 3, regex: /\bjoga\s*bem\b|\bbem\b/i },
  { level: 2, regex: /\bm[e\u00e9]dio\b|\bmedian[oa]\b|\bmais\s*ou\s*menos\b/i },
  { level: 1, regex: /\bjoga\s*mal\b|\bmal\b|\bruim\b|\bfraco\b/i },
];

const GOALKEEPER_PATTERN = /\bgoleir[oa]\b|\bgk\b/i;

function toTitleCase(str: string): string {
  return str
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function cleanName(raw: string): string {
  let name = raw;
  name = name.replace(/^\s*[\d]+[.)]\s*/, "");
  name = name.replace(/^[\s\-\u2013\u2022*]+/, "");
  name = name.replace(/\bjoga\b/gi, " ");
  name = name.replace(/^[\s\-\u2013:,.]+|[\s\-\u2013:,.]+$/g, "");
  name = name.replace(/\s{2,}/g, " ").trim();
  return toTitleCase(name);
}

export function parseWhatsappList(text: string, defaultLevel: Level): ParsedPlayer[] {
  const results: ParsedPlayer[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    let remainder = line;
    const goalkeeperMatch = GOALKEEPER_PATTERN.exec(remainder);
    const isGoalkeeper = goalkeeperMatch !== null;
    if (goalkeeperMatch) {
      remainder =
        remainder.slice(0, goalkeeperMatch.index) +
        remainder.slice(goalkeeperMatch.index + goalkeeperMatch[0].length);
    }

    let detected: Level | null = null;
    for (const pattern of LEVEL_PATTERNS) {
      const match = pattern.regex.exec(remainder);
      if (!match) continue;

      detected = pattern.level;
      remainder = remainder.slice(0, match.index) + remainder.slice(match.index + match[0].length);
      break;
    }

    const name = cleanName(remainder);
    if (!name) continue;

    results.push({
      id: crypto.randomUUID(),
      name,
      level: detected ?? defaultLevel,
      matched: detected !== null,
      isGoalkeeper,
    });
  }

  return results;
}
