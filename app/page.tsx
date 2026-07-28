"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AppChrome, AppHeader } from "./src/components/AppChrome";
import { DrawPanel } from "./src/components/DrawPanel";
import { PlayerPanel } from "./src/components/PlayerPanel";
import { TeamCard } from "./src/components/TeamCard";
import { balanceTeams } from "./src/domain/teamBalancer";
import { parseWhatsappList } from "./src/domain/whatsappParser";
import type { Level, ParsedPlayer, Player, Team } from "./src/domain/types";

export default function TeamBalancer(): React.JSX.Element {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Level>(2);
  const [isGoalkeeperInput, setIsGoalkeeperInput] = useState(false);
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState<Level>(2);
  const [editGoalkeeper, setEditGoalkeeper] = useState(false);
  const [editError, setEditError] = useState("");

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkDefaultLevel, setBulkDefaultLevel] = useState<Level>(2);
  const [preview, setPreview] = useState<ParsedPlayer[] | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");

  const canDraw = players.length >= numTeams * 2;

  const levelCounts = useMemo(() => {
    const counts: Record<Level, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    players.forEach((player) => counts[player.level]++);
    return counts;
  }, [players]);

  const goalkeeperCount = useMemo(() => players.filter((player) => player.isGoalkeeper).length, [players]);

  function clearTeams(): void {
    setTeams(null);
  }

  function addPlayer(event: FormEvent): void {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Digite o nome do jogador.");
      return;
    }

    if (players.some((player) => player.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Esse jogador ja foi adicionado.");
      return;
    }

    setPlayers((previousPlayers) => [
      ...previousPlayers,
      { id: crypto.randomUUID(), name: trimmed, level, isGoalkeeper: isGoalkeeperInput },
    ]);
    setName("");
    setIsGoalkeeperInput(false);
    setError("");
    clearTeams();
  }

  function removePlayer(id: string): void {
    setPlayers((previousPlayers) => previousPlayers.filter((player) => player.id !== id));
    clearTeams();
    if (editingId === id) setEditingId(null);
  }

  function startEdit(player: Player): void {
    setEditingId(player.id);
    setEditName(player.name);
    setEditLevel(player.level);
    setEditGoalkeeper(player.isGoalkeeper);
    setEditError("");
  }

  function cancelEdit(): void {
    setEditingId(null);
    setEditError("");
  }

  function saveEdit(id: string): void {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError("O nome nao pode ficar vazio.");
      return;
    }

    const duplicate = players.some(
      (player) => player.id !== id && player.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setEditError("Ja existe outro jogador com esse nome.");
      return;
    }

    setPlayers((previousPlayers) =>
      previousPlayers.map((player) =>
        player.id === id ? { ...player, name: trimmed, level: editLevel, isGoalkeeper: editGoalkeeper } : player
      )
    );
    setEditingId(null);
    setEditError("");
    clearTeams();
  }

  function drawTeams(): void {
    if (!canDraw) return;
    setTeams(balanceTeams(players, numTeams));
  }

  function resetAll(): void {
    setPlayers([]);
    clearTeams();
    setError("");
    setEditingId(null);
    setEditError("");
  }

  function processBulk(): void {
    const parsed = parseWhatsappList(bulkText, bulkDefaultLevel);
    if (parsed.length === 0) {
      setBulkMessage("Nao encontrei nenhum nome nessas linhas.");
      setPreview(null);
      return;
    }

    setPreview(parsed);
    setBulkMessage("");
  }

  function updatePreviewName(id: string, newName: string): void {
    setPreview((previousPreview) =>
      previousPreview ? previousPreview.map((player) => (player.id === id ? { ...player, name: newName } : player)) : previousPreview
    );
  }

  function updatePreviewLevel(id: string, newLevel: Level): void {
    setPreview((previousPreview) =>
      previousPreview
        ? previousPreview.map((player) => (player.id === id ? { ...player, level: newLevel, matched: true } : player))
        : previousPreview
    );
  }

  function togglePreviewGoalkeeper(id: string): void {
    setPreview((previousPreview) =>
      previousPreview
        ? previousPreview.map((player) =>
            player.id === id ? { ...player, isGoalkeeper: !player.isGoalkeeper } : player
          )
        : previousPreview
    );
  }

  function removePreviewRow(id: string): void {
    setPreview((previousPreview) => (previousPreview ? previousPreview.filter((player) => player.id !== id) : previousPreview));
  }

  function confirmBulkAdd(): void {
    if (!preview) return;

    const existingNames = new Set(players.map((player) => player.name.toLowerCase()));
    const seenInBatch = new Set<string>();
    const playersToAdd: Player[] = [];
    let skipped = 0;

    for (const player of preview) {
      const trimmed = player.name.trim();
      const key = trimmed.toLowerCase();
      if (!trimmed || existingNames.has(key) || seenInBatch.has(key)) {
        skipped++;
        continue;
      }

      seenInBatch.add(key);
      playersToAdd.push({
        id: crypto.randomUUID(),
        name: trimmed,
        level: player.level,
        isGoalkeeper: player.isGoalkeeper,
      });
    }

    setPlayers((previousPlayers) => [...previousPlayers, ...playersToAdd]);
    clearTeams();
    setBulkMessage(
      skipped > 0
        ? `${playersToAdd.length} jogador(es) adicionado(s), ${skipped} ignorado(s) por duplicidade.`
        : `${playersToAdd.length} jogador(es) adicionado(s).`
    );
    setPreview(null);
    setBulkText("");
    setBulkOpen(false);
  }

  function changeNumTeams(nextNumTeams: number): void {
    setNumTeams(nextNumTeams);
    clearTeams();
  }

  function toggleBulkImport(): void {
    setBulkOpen((isOpen) => !isOpen);
    setBulkMessage("");
  }

  return (
    <AppChrome>
      <AppHeader />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <PlayerPanel
          players={players}
          name={name}
          level={level}
          isGoalkeeperInput={isGoalkeeperInput}
          error={error}
          bulkOpen={bulkOpen}
          bulkText={bulkText}
          bulkDefaultLevel={bulkDefaultLevel}
          bulkMessage={bulkMessage}
          preview={preview}
          editingId={editingId}
          editName={editName}
          editLevel={editLevel}
          editGoalkeeper={editGoalkeeper}
          editError={editError}
          onSubmit={addPlayer}
          onNameChange={setName}
          onLevelChange={setLevel}
          onGoalkeeperInputChange={setIsGoalkeeperInput}
          onToggleBulk={toggleBulkImport}
          onBulkTextChange={setBulkText}
          onBulkDefaultLevelChange={setBulkDefaultLevel}
          onProcessBulk={processBulk}
          onPreviewNameChange={updatePreviewName}
          onPreviewLevelChange={updatePreviewLevel}
          onPreviewGoalkeeperToggle={togglePreviewGoalkeeper}
          onPreviewRemove={removePreviewRow}
          onConfirmBulk={confirmBulkAdd}
          onReset={resetAll}
          onRemove={removePlayer}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onEditNameChange={setEditName}
          onEditLevelChange={setEditLevel}
          onEditGoalkeeperChange={setEditGoalkeeper}
        />

        <DrawPanel
          numTeams={numTeams}
          levelCounts={levelCounts}
          goalkeeperCount={goalkeeperCount}
          canDraw={canDraw}
          teams={teams}
          onNumTeamsChange={changeNumTeams}
          onDraw={drawTeams}
        />
      </div>

      {teams && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {teams.map((team, index) => (
              <TeamCard key={index} team={team} index={index} />
            ))}
          </div>
        </div>
      )}
    </AppChrome>
  );
}
