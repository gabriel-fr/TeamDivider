"use client"



import React, { useState, useMemo } from "react";
import { Plus, X, Shuffle, Users, RotateCcw, Trophy, ClipboardPaste, Check, Hand, Pencil } from "lucide-react";

// ---- Tipos ---------------------------------------------------------------

type Level = 1 | 2 | 3 | 4;

interface LevelInfo {
  value: Level;
  label: string;
  short: string;
}

interface Player {
  id: string;
  name: string;
  level: Level;
  isGoalkeeper: boolean;
}

interface Team {
  players: Player[];
  total: number;
  hasGoalkeeper: boolean;
}

interface Jersey {
  name: string;
  accent: string;
  bg: string;
}

interface ParsedPlayer {
  id: string;
  name: string;
  level: Level;
  matched: boolean; // false = nível não identificado no texto, caiu no padrão
  isGoalkeeper: boolean;
}

// ---- Domínio ---------------------------------------------------------

const LEVELS: LevelInfo[] = [
  { value: 1, label: "Joga mal", short: "Mal" },
  { value: 2, label: "Joga médio", short: "Médio" },
  { value: 3, label: "Joga bem", short: "Bem" },
  { value: 4, label: "Joga muito bem", short: "Muito bem" },
];

const JERSEYS: Jersey[] = [
  { name: "Coral", accent: "#FF6B4A", bg: "rgba(255,107,74,0.12)" },
  { name: "Azul", accent: "#4A9EFF", bg: "rgba(74,158,255,0.12)" },
  { name: "Violeta", accent: "#B98CFF", bg: "rgba(185,140,255,0.12)" },
  { name: "Verde-limão", accent: "#B4E23D", bg: "rgba(180,226,61,0.12)" },
];

function levelInfo(value: Level): LevelInfo {
  return LEVELS.find((l) => l.value === value) as LevelInfo;
}

// Fisher-Yates para embaralhar antes do sort estável — assim, entre jogadores
// de mesmo nível, a ordem (e portanto o time) muda a cada sorteio.
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

// Distribuição gulosa: sempre entra no time com menor soma de nível;
// em empate, no time com menos jogadores. Processar do mais forte pro
// mais fraco evita que os "joga muito bem" fiquem concentrados.
//
// Goleiros são tratados numa fase anterior: cada time recebe um goleiro
// (o de menor nível vai pro time mais fraco, e assim por diante) antes de
// qualquer jogador de linha entrar — assim todo time fecha com pelo menos
// um goleiro, quando há goleiros suficientes.
function balanceTeams(players: Player[], numTeams: number): Team[] {
  const teams: Team[] = Array.from({ length: numTeams }, () => ({
    players: [],
    total: 0,
    hasGoalkeeper: false,
  }));

  const shuffled = shuffle(players);
  const keepers = shuffled.filter((p) => p.isGoalkeeper).sort((a, b) => b.level - a.level);
  const outfield = shuffled.filter((p) => !p.isGoalkeeper).sort((a, b) => b.level - a.level);
  const leftoverKeepers: Player[] = [];

  for (const gk of keepers) {
    const candidates = teams.filter((t) => !t.hasGoalkeeper);
    if (candidates.length === 0) {
      leftoverKeepers.push(gk);
      continue;
    }
    const target = pickLowestTotal(candidates);
    target.players.push(gk);
    target.total += gk.level;
    target.hasGoalkeeper = true;
  }

  const rest = shuffle([...leftoverKeepers, ...outfield]).sort((a, b) => b.level - a.level);
  for (const player of rest) {
    const target = pickLowestTotal(teams);
    target.players.push(player);
    target.total += player.level;
  }

  return teams;
}

// ---- Importação de lista colada (ex: do WhatsApp) ------------------------

const LEVEL_PATTERNS: { level: Level; regex: RegExp }[] = [
  { level: 4, regex: /\bmuito\s*bem\b|\bmuito\s*boa?\b/i },
  { level: 3, regex: /\bjoga\s*bem\b|\bbem\b/i },
  { level: 2, regex: /\bm[eé]dio\b|\bmedian[oa]\b|\bmais\s*ou\s*menos\b/i },
  { level: 1, regex: /\bjoga\s*mal\b|\bmal\b|\bruim\b|\bfraco\b/i },
];

const GOALKEEPER_PATTERN = /\bgoleir[oa]\b|\bgk\b/i;

function toTitleCase(str: string): string {
  return str
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function cleanName(raw: string): string {
  let name = raw;
  // remove marcadores de lista: "1.", "1)", "-", "•", "*"
  name = name.replace(/^\s*[\d]+[.)]\s*/, "");
  name = name.replace(/^[\s\-–•*]+/, "");
  // remove verbo solto "joga" que sobra depois de tirar o nível
  name = name.replace(/\bjoga\b/gi, " ");
  // limpa pontuação e espaços nas bordas
  name = name.replace(/^[\s\-–:,.]+|[\s\-–:,.]+$/g, "");
  name = name.replace(/\s{2,}/g, " ").trim();
  return toTitleCase(name);
}

function parseWhatsappList(text: string, defaultLevel: Level): ParsedPlayer[] {
  const lines = text.split("\n");
  const results: ParsedPlayer[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let remainder = line;

    const gkMatch = GOALKEEPER_PATTERN.exec(remainder);
    const isGoalkeeper = gkMatch !== null;
    if (gkMatch) {
      remainder = remainder.slice(0, gkMatch.index) + remainder.slice(gkMatch.index + gkMatch[0].length);
    }

    let detected: Level | null = null;
    for (const pattern of LEVEL_PATTERNS) {
      const match = pattern.regex.exec(remainder);
      if (match) {
        detected = pattern.level;
        remainder = remainder.slice(0, match.index) + remainder.slice(match.index + match[0].length);
        break;
      }
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

// ---- UI -----------------------------------------------------------------

function FieldTexture(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(180deg, rgba(244,241,232,0.025) 0px, rgba(244,241,232,0.025) 60px, transparent 60px, transparent 120px)",
        pointerEvents: "none",
      }}
    />
  );
}

interface LevelPickerProps {
  value: Level;
  onChange: (value: Level) => void;
  compact?: boolean;
}

function LevelPicker({ value, onChange, compact }: LevelPickerProps): React.JSX.Element {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {LEVELS.map((lvl) => {
        const active = value === lvl.value;
        return (
          <button
            key={lvl.value}
            type="button"
            onClick={() => onChange(lvl.value)}
            aria-pressed={active}
            style={{
              flex: compact ? "0 0 auto" : "1 1 auto",
              minWidth: compact ? 0 : 78,
              padding: compact ? "5px 8px" : "8px 10px",
              borderRadius: 8,
              border: active ? "1.5px solid #E8B923" : "1.5px solid rgba(244,241,232,0.14)",
              background: active ? "rgba(232,185,35,0.14)" : "rgba(244,241,232,0.03)",
              color: active ? "#E8B923" : "#C9D1C6",
              fontSize: compact ? 11 : 12.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "'Work Sans', sans-serif",
            }}
          >
            {lvl.short}
          </button>
        );
      })}
    </div>
  );
}

function BalanceMeter({ teams }: { teams: Team[] }): React.JSX.Element | null {
  if (teams.length !== 2) return null;
  const [a, b] = teams;
  const totalSum = a.total + b.total || 1;
  const aPct = (a.total / totalSum) * 100;

  return (
    <div style={{ maxWidth: 460, margin: "0 auto 8px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Work Sans', sans-serif",
          fontSize: 11.5,
          color: "#8FA396",
          marginBottom: 6,
          letterSpacing: 0.3,
        }}
      >
        <span>FORÇA TIME 1 · {a.total}</span>
        <span>FORÇA TIME 2 · {b.total}</span>
      </div>
      <div
        style={{
          position: "relative",
          height: 10,
          borderRadius: 999,
          background: "rgba(244,241,232,0.08)",
          overflow: "hidden",
          border: "1px solid rgba(244,241,232,0.1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${aPct}%`,
            background: "linear-gradient(90deg, #FF6B4A, #FF8A6A)",
            transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: 2,
            background: "rgba(244,241,232,0.35)",
          }}
        />
      </div>
      <p
        style={{
          textAlign: "center",
          marginTop: 8,
          fontFamily: "'Work Sans', sans-serif",
          fontSize: 12.5,
          color: Math.abs(a.total - b.total) <= 1 ? "#B4E23D" : "#E8B923",
          fontWeight: 600,
        }}
      >
        {Math.abs(a.total - b.total) <= 1
          ? "⚽ Times equilibrados"
          : `Diferença de ${Math.abs(a.total - b.total)} ponto(s) de nível`}
      </p>
    </div>
  );
}

function TeamCard({ team, index }: { team: Team; index: number }): React.JSX.Element {
  const jersey = JERSEYS[index % JERSEYS.length];
  const avg = team.players.length ? (team.total / team.players.length).toFixed(1) : "0.0";

  return (
    <div
      style={{
        flex: "1 1 260px",
        minWidth: 240,
        background: "rgba(244,241,232,0.03)",
        border: `1px solid ${jersey.accent}33`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          background: jersey.bg,
          borderBottom: `1px solid ${jersey.accent}33`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 22,
              letterSpacing: 0.5,
              color: jersey.accent,
            }}
          >
            TIME {index + 1}
          </div>
          <div style={{ fontSize: 11, color: "#8FA396", fontFamily: "'Work Sans', sans-serif" }}>
            {team.players.length} jogador{team.players.length !== 1 ? "es" : ""} · nível médio {avg}
          </div>
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: jersey.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 16,
            color: "#0F2818",
          }}
        >
          {team.total}
        </div>
      </div>

      {!team.hasGoalkeeper && (
        <div
          style={{
            padding: "6px 18px",
            background: "rgba(255,107,74,0.12)",
            fontSize: 11.5,
            color: "#FF6B4A",
            fontWeight: 600,
          }}
        >
          Sem goleiro escalado
        </div>
      )}

      <ul style={{ listStyle: "none", margin: 0, padding: "8px 10px" }}>
        {team.players
          .slice()
          .sort((a, b) => Number(b.isGoalkeeper) - Number(a.isGoalkeeper) || b.level - a.level)
          .map((p) => {
            const info = levelInfo(p.level);
            return (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 8px",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: 14,
                  color: "#F4F1E8",
                  borderBottom: "1px solid rgba(244,241,232,0.06)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {p.name}
                  {p.isGoalkeeper && (
                    <span
                      title="Goleiro"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 10,
                        fontWeight: 700,
                        color: jersey.accent,
                        border: `1px solid ${jersey.accent}66`,
                        borderRadius: 5,
                        padding: "1px 5px",
                      }}
                    >
                      <Hand size={9} /> GOL
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 11, color: "#8FA396", fontWeight: 600 }}>
                  {info.short}
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default function TeamBalancer(): React.JSX.Element {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Level>(2);
  const [isGoalkeeperInput, setIsGoalkeeperInput] = useState(false);
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState("");

  // Edição de jogador já cadastrado
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState<Level>(2);
  const [editGoalkeeper, setEditGoalkeeper] = useState(false);
  const [editError, setEditError] = useState("");

  // Importação em lote
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkDefaultLevel, setBulkDefaultLevel] = useState<Level>(2);
  const [preview, setPreview] = useState<ParsedPlayer[] | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");

  const canDraw = players.length >= numTeams * 2;

  const levelCounts = useMemo(() => {
    const counts: Record<Level, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    players.forEach((p) => counts[p.level]++);
    return counts;
  }, [players]);

  const goalkeeperCount = useMemo(
    () => players.filter((p) => p.isGoalkeeper).length,
    [players]
  );

  function addPlayer(e: React.FormEvent): void {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Digite o nome do jogador.");
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Esse jogador já foi adicionado.");
      return;
    }
    setPlayers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, level, isGoalkeeper: isGoalkeeperInput },
    ]);
    setName("");
    setIsGoalkeeperInput(false);
    setError("");
    setTeams(null);
  }

  function removePlayer(id: string): void {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setTeams(null);
    if (editingId === id) setEditingId(null);
  }

  function startEdit(p: Player): void {
    setEditingId(p.id);
    setEditName(p.name);
    setEditLevel(p.level);
    setEditGoalkeeper(p.isGoalkeeper);
    setEditError("");
  }

  function cancelEdit(): void {
    setEditingId(null);
    setEditError("");
  }

  function saveEdit(id: string): void {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError("O nome não pode ficar vazio.");
      return;
    }
    const duplicate = players.some(
      (p) => p.id !== id && p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setEditError("Já existe outro jogador com esse nome.");
      return;
    }
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: trimmed, level: editLevel, isGoalkeeper: editGoalkeeper } : p
      )
    );
    setEditingId(null);
    setEditError("");
    setTeams(null);
  }

  function handleDraw(): void {
    if (!canDraw) return;
    setTeams(balanceTeams(players, numTeams));
  }

  function resetAll(): void {
    setPlayers([]);
    setTeams(null);
    setError("");
    setEditingId(null);
    setEditError("");
  }

  // ---- Importação em lote ----

  function processBulk(): void {
    const parsed = parseWhatsappList(bulkText, bulkDefaultLevel);
    if (parsed.length === 0) {
      setBulkMessage("Não encontrei nenhum nome nessas linhas.");
      setPreview(null);
      return;
    }
    setPreview(parsed);
    setBulkMessage("");
  }

  function updatePreviewName(id: string, newName: string): void {
    setPreview((prev) => (prev ? prev.map((p) => (p.id === id ? { ...p, name: newName } : p)) : prev));
  }

  function updatePreviewLevel(id: string, newLevel: Level): void {
    setPreview((prev) =>
      prev ? prev.map((p) => (p.id === id ? { ...p, level: newLevel, matched: true } : p)) : prev
    );
  }

  function togglePreviewGoalkeeper(id: string): void {
    setPreview((prev) =>
      prev ? prev.map((p) => (p.id === id ? { ...p, isGoalkeeper: !p.isGoalkeeper } : p)) : prev
    );
  }

  function removePreviewRow(id: string): void {
    setPreview((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
  }

  function confirmBulkAdd(): void {
    if (!preview) return;
    const existingNames = new Set(players.map((p) => p.name.toLowerCase()));
    const seenInBatch = new Set<string>();
    const toAdd: Player[] = [];
    let skipped = 0;

    for (const p of preview) {
      const trimmed = p.name.trim();
      const key = trimmed.toLowerCase();
      if (!trimmed || existingNames.has(key) || seenInBatch.has(key)) {
        skipped++;
        continue;
      }
      seenInBatch.add(key);
      toAdd.push({
        id: crypto.randomUUID(),
        name: trimmed,
        level: p.level,
        isGoalkeeper: p.isGoalkeeper,
      });
    }

    setPlayers((prev) => [...prev, ...toAdd]);
    setTeams(null);
    setBulkMessage(
      skipped > 0
        ? `${toAdd.length} jogador(es) adicionado(s), ${skipped} ignorado(s) por duplicidade.`
        : `${toAdd.length} jogador(es) adicionado(s).`
    );
    setPreview(null);
    setBulkText("");
    setBulkOpen(false);
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100%",
        background: "linear-gradient(180deg, #0F2818 0%, #14301D 100%)",
        color: "#F4F1E8",
        fontFamily: "'Work Sans', sans-serif",
        padding: "32px 16px 56px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:wght@400;500;600;700&display=swap');
        input::placeholder, textarea::placeholder { color: #6B7D70; }
        *:focus-visible { outline: 2px solid #E8B923; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>
      <FieldTexture />

      <div style={{ position: "relative", maxWidth: 880, margin: "0 auto" }}>
        {/* Cabeçalho */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 12px",
              borderRadius: 999,
              background: "rgba(232,185,35,0.12)",
              border: "1px solid rgba(232,185,35,0.3)",
              fontSize: 11.5,
              fontWeight: 600,
              color: "#E8B923",
              letterSpacing: 0.5,
              marginBottom: 14,
            }}
          >
            <Trophy size={13} /> SORTEIO PRA RACHA
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(38px, 7vw, 58px)",
              letterSpacing: 1,
              margin: 0,
              lineHeight: 1,
            }}
          >
            MONTA OS TIMES
          </h1>
          <p style={{ color: "#8FA396", fontSize: 14.5, marginTop: 10 }}>
            Cadastre os jogadores com o nível de cada um e deixe o algoritmo
            equilibrar as escalações.
          </p>
        </header>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Formulário */}
          <div
            style={{
              flex: "1 1 320px",
              minWidth: 280,
              background: "rgba(244,241,232,0.03)",
              border: "1px solid rgba(244,241,232,0.1)",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <form onSubmit={addPlayer}>
              <label
                htmlFor="player-name"
                style={{ fontSize: 12, color: "#8FA396", fontWeight: 600, letterSpacing: 0.3 }}
              >
                NOME DO JOGADOR
              </label>
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Rafael"
                style={{
                  width: "100%",
                  marginTop: 6,
                  marginBottom: 14,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(244,241,232,0.14)",
                  background: "rgba(0,0,0,0.2)",
                  color: "#F4F1E8",
                  fontSize: 14.5,
                  fontFamily: "'Work Sans', sans-serif",
                  boxSizing: "border-box",
                }}
              />

              <label
                style={{
                  fontSize: 12,
                  color: "#8FA396",
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                NÍVEL DE FUTEBOL
              </label>
              <LevelPicker value={level} onChange={setLevel} />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 12,
                  fontSize: 13,
                  color: "#C9D1C6",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isGoalkeeperInput}
                  onChange={(e) => setIsGoalkeeperInput(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: "#E8B923" }}
                />
                <Hand size={13} color="#8FA396" /> É goleiro
              </label>

              {error && (
                <p style={{ color: "#FF6B4A", fontSize: 12.5, marginTop: 10, marginBottom: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "11px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "#E8B923",
                  color: "#0F2818",
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Plus size={16} /> Adicionar jogador
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setBulkOpen((v) => !v);
                setBulkMessage("");
              }}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "8px 0",
                borderRadius: 8,
                border: "1px dashed rgba(244,241,232,0.2)",
                background: "transparent",
                color: "#8FA396",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <ClipboardPaste size={13} />
              {bulkOpen ? "Fechar importação de lista" : "Colar lista do WhatsApp"}
            </button>

            {bulkOpen && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.15)",
                  border: "1px solid rgba(244,241,232,0.08)",
                }}
              >
                <p style={{ fontSize: 11.5, color: "#8FA396", margin: "0 0 8px" }}>
                  Cole uma linha por jogador, por exemplo:
                  <br />
                  <span style={{ color: "#C9D1C6" }}>
                    Rafael - joga bem
                    <br />
                    Marcos: goleiro, muito bem
                    <br />
                    Pedro mal
                  </span>
                </p>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={"Rafael - joga bem\nMarcos: goleiro, muito bem\nPedro mal"}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(244,241,232,0.14)",
                    background: "rgba(0,0,0,0.2)",
                    color: "#F4F1E8",
                    fontSize: 13.5,
                    fontFamily: "'Work Sans', sans-serif",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />

                <label
                  style={{
                    fontSize: 11,
                    color: "#8FA396",
                    fontWeight: 600,
                    display: "block",
                    margin: "10px 0 6px",
                  }}
                >
                  NÍVEL PADRÃO PARA LINHAS SEM NÍVEL IDENTIFICADO
                </label>
                <LevelPicker value={bulkDefaultLevel} onChange={setBulkDefaultLevel} compact />

                <button
                  type="button"
                  onClick={processBulk}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: "9px 0",
                    borderRadius: 8,
                    border: "none",
                    background: "#4A9EFF",
                    color: "#0F2818",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  Processar lista
                </button>

                {bulkMessage && (
                  <p style={{ fontSize: 12, color: "#B4E23D", marginTop: 8, marginBottom: 0 }}>
                    {bulkMessage}
                  </p>
                )}

                {preview && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 11.5, color: "#8FA396", margin: "0 0 8px" }}>
                      Confira antes de adicionar — ajuste nome ou nível se precisar:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                      {preview.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                            background: "rgba(244,241,232,0.03)",
                            borderRadius: 8,
                            padding: 6,
                            border: p.matched ? "1px solid rgba(244,241,232,0.08)" : "1px solid rgba(232,185,35,0.35)",
                          }}
                        >
                          <input
                            value={p.name}
                            onChange={(e) => updatePreviewName(p.id, e.target.value)}
                            style={{
                              flex: "1 1 100px",
                              minWidth: 90,
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid rgba(244,241,232,0.14)",
                              background: "rgba(0,0,0,0.2)",
                              color: "#F4F1E8",
                              fontSize: 13,
                              fontFamily: "'Work Sans', sans-serif",
                            }}
                          />
                          <LevelPicker
                            value={p.level}
                            onChange={(lvl) => updatePreviewLevel(p.id, lvl)}
                            compact
                          />
                          <button
                            type="button"
                            onClick={() => togglePreviewGoalkeeper(p.id)}
                            aria-pressed={p.isGoalkeeper}
                            title="Marcar como goleiro"
                            style={{
                              flex: "0 0 auto",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 30,
                              height: 30,
                              borderRadius: 6,
                              border: p.isGoalkeeper ? "1.5px solid #E8B923" : "1.5px solid rgba(244,241,232,0.14)",
                              background: p.isGoalkeeper ? "rgba(232,185,35,0.14)" : "transparent",
                              color: p.isGoalkeeper ? "#E8B923" : "#8FA396",
                              cursor: "pointer",
                            }}
                          >
                            <Hand size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePreviewRow(p.id)}
                            aria-label={`Remover ${p.name} da lista`}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#8FA396",
                              cursor: "pointer",
                              padding: 4,
                              display: "flex",
                              flex: "0 0 auto",
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 10.5, color: "#8FA396", marginTop: 6 }}>
                      Linhas com borda amarela tiveram o nível preenchido no padrão — não foi identificado no texto.
                    </p>
                    <button
                      type="button"
                      onClick={confirmBulkAdd}
                      disabled={preview.length === 0}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        padding: "10px 0",
                        borderRadius: 8,
                        border: "none",
                        background: preview.length ? "#E8B923" : "rgba(244,241,232,0.08)",
                        color: preview.length ? "#0F2818" : "#6B7D70",
                        fontWeight: 700,
                        fontSize: 13.5,
                        cursor: preview.length ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Check size={14} /> Adicionar {preview.length} jogador{preview.length !== 1 ? "es" : ""}
                    </button>
                  </div>
                )}
              </div>
            )}

            {players.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(244,241,232,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#8FA396", fontWeight: 600 }}>
                    <Users size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
                    {players.length} NA LISTA
                  </span>
                  <button
                    type="button"
                    onClick={resetAll}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#8FA396",
                      fontSize: 11.5,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <RotateCcw size={11} /> limpar tudo
                  </button>
                </div>

                <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 320, overflowY: "auto" }}>
                  {players.map((p) => {
                    const info = levelInfo(p.level);
                    const isEditing = editingId === p.id;

                    if (isEditing) {
                      return (
                        <li
                          key={p.id}
                          style={{
                            padding: "8px",
                            marginBottom: 6,
                            borderRadius: 8,
                            background: "rgba(232,185,35,0.06)",
                            border: "1px solid rgba(232,185,35,0.3)",
                          }}
                        >
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                            style={{
                              width: "100%",
                              marginBottom: 8,
                              padding: "7px 9px",
                              borderRadius: 6,
                              border: "1px solid rgba(244,241,232,0.14)",
                              background: "rgba(0,0,0,0.2)",
                              color: "#F4F1E8",
                              fontSize: 13.5,
                              fontFamily: "'Work Sans', sans-serif",
                              boxSizing: "border-box",
                            }}
                          />
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <LevelPicker value={editLevel} onChange={setEditLevel} compact />
                            <button
                              type="button"
                              onClick={() => setEditGoalkeeper((v) => !v)}
                              aria-pressed={editGoalkeeper}
                              title="Marcar como goleiro"
                              style={{
                                flex: "0 0 auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 30,
                                height: 30,
                                borderRadius: 6,
                                border: editGoalkeeper
                                  ? "1.5px solid #E8B923"
                                  : "1.5px solid rgba(244,241,232,0.14)",
                                background: editGoalkeeper ? "rgba(232,185,35,0.14)" : "transparent",
                                color: editGoalkeeper ? "#E8B923" : "#8FA396",
                                cursor: "pointer",
                              }}
                            >
                              <Hand size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEdit(p.id)}
                              aria-label="Salvar edição"
                              style={{
                                flex: "0 0 auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 30,
                                height: 30,
                                borderRadius: 6,
                                border: "none",
                                background: "#B4E23D",
                                color: "#0F2818",
                                cursor: "pointer",
                              }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              aria-label="Cancelar edição"
                              style={{
                                flex: "0 0 auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 30,
                                height: 30,
                                borderRadius: 6,
                                border: "1px solid rgba(244,241,232,0.14)",
                                background: "transparent",
                                color: "#8FA396",
                                cursor: "pointer",
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {editError && (
                            <p style={{ color: "#FF6B4A", fontSize: 11.5, marginTop: 6, marginBottom: 0 }}>
                              {editError}
                            </p>
                          )}
                        </li>
                      );
                    }

                    return (
                      <li
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "7px 8px",
                          fontSize: 13.5,
                          borderRadius: 6,
                        }}
                      >
                        <span>
                          {p.name}{" "}
                          <span style={{ color: "#8FA396", fontSize: 11.5 }}>· {info.short}</span>
                          {p.isGoalkeeper && (
                            <span style={{ color: "#E8B923", fontSize: 11, fontWeight: 700 }}> · GOL</span>
                          )}
                        </span>
                        <span style={{ display: "flex", gap: 2, flex: "0 0 auto" }}>
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            aria-label={`Editar ${p.name}`}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#8FA396",
                              cursor: "pointer",
                              padding: 4,
                              display: "flex",
                            }}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePlayer(p.id)}
                            aria-label={`Remover ${p.name}`}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#8FA396",
                              cursor: "pointer",
                              padding: 4,
                              display: "flex",
                            }}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Configuração + sorteio */}
          <div style={{ flex: "1 1 320px", minWidth: 280, display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "rgba(244,241,232,0.03)",
                border: "1px solid rgba(244,241,232,0.1)",
                borderRadius: 14,
                padding: 20,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  color: "#8FA396",
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                QUANTOS TIMES?
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setNumTeams(n);
                      setTeams(null);
                    }}
                    aria-pressed={numTeams === n}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 8,
                      border: numTeams === n ? "1.5px solid #E8B923" : "1.5px solid rgba(244,241,232,0.14)",
                      background: numTeams === n ? "rgba(232,185,35,0.14)" : "transparent",
                      color: numTeams === n ? "#E8B923" : "#C9D1C6",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "#8FA396", marginBottom: 6 }}>
                Distribuição por nível: mal {levelCounts[1]} · médio {levelCounts[2]} · bem{" "}
                {levelCounts[3]} · muito bem {levelCounts[4]}
              </div>

              <div
                style={{
                  fontSize: 12,
                  marginBottom: 14,
                  color: goalkeeperCount < numTeams ? "#E8B923" : "#8FA396",
                  fontWeight: goalkeeperCount < numTeams ? 600 : 400,
                }}
              >
                <Hand size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
                {goalkeeperCount} goleiro{goalkeeperCount !== 1 ? "s" : ""} cadastrado
                {goalkeeperCount !== 1 ? "s" : ""}
                {goalkeeperCount < numTeams &&
                  ` — faltam ${numTeams - goalkeeperCount} para garantir 1 por time`}
              </div>

              <button
                type="button"
                onClick={handleDraw}
                disabled={!canDraw}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 8,
                  border: "none",
                  background: canDraw ? "#FF6B4A" : "rgba(244,241,232,0.08)",
                  color: canDraw ? "#0F2818" : "#6B7D70",
                  fontWeight: 700,
                  fontSize: 15.5,
                  cursor: canDraw ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Shuffle size={17} /> Sortear times
              </button>
              {!canDraw && (
                <p style={{ fontSize: 11.5, color: "#8FA396", marginTop: 8, marginBottom: 0 }}>
                  Adicione pelo menos {numTeams * 2} jogadores ({numTeams} times, 2 por time).
                </p>
              )}
            </div>

            {teams && (
              <div
                style={{
                  background: "rgba(244,241,232,0.03)",
                  border: "1px solid rgba(244,241,232,0.1)",
                  borderRadius: 14,
                  padding: "16px 16px 4px",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 11.5, color: "#8FA396", fontWeight: 600, letterSpacing: 0.3 }}>
                  EQUILÍBRIO
                </span>
                <div style={{ marginTop: 10 }}>
                  <BalanceMeter teams={teams} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resultado */}
        {teams && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {teams.map((team, i) => (
                <TeamCard key={i} team={team} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
