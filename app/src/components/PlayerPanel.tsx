"use client";

import { ClipboardPaste, Hand, Plus } from "lucide-react";
import type { FormEvent } from "react";
import type { Level, ParsedPlayer, Player } from "../domain/types";
import { BulkImportPanel } from "./BulkImportPanel";
import { LevelPicker } from "./LevelPicker";
import { PlayerList } from "./PlayerList";

interface PlayerPanelProps {
  players: Player[];
  name: string;
  level: Level;
  isGoalkeeperInput: boolean;
  error: string;
  bulkOpen: boolean;
  bulkText: string;
  bulkDefaultLevel: Level;
  bulkMessage: string;
  preview: ParsedPlayer[] | null;
  editingId: string | null;
  editName: string;
  editLevel: Level;
  editGoalkeeper: boolean;
  editError: string;
  onSubmit: (event: FormEvent) => void;
  onNameChange: (name: string) => void;
  onLevelChange: (level: Level) => void;
  onGoalkeeperInputChange: (value: boolean) => void;
  onToggleBulk: () => void;
  onBulkTextChange: (text: string) => void;
  onBulkDefaultLevelChange: (level: Level) => void;
  onProcessBulk: () => void;
  onPreviewNameChange: (id: string, name: string) => void;
  onPreviewLevelChange: (id: string, level: Level) => void;
  onPreviewGoalkeeperToggle: (id: string) => void;
  onPreviewRemove: (id: string) => void;
  onConfirmBulk: () => void;
  onReset: () => void;
  onRemove: (id: string) => void;
  onStartEdit: (player: Player) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onEditNameChange: (name: string) => void;
  onEditLevelChange: (level: Level) => void;
  onEditGoalkeeperChange: (updater: (value: boolean) => boolean) => void;
}

export function PlayerPanel({
  players,
  name,
  level,
  isGoalkeeperInput,
  error,
  bulkOpen,
  bulkText,
  bulkDefaultLevel,
  bulkMessage,
  preview,
  editingId,
  editName,
  editLevel,
  editGoalkeeper,
  editError,
  onSubmit,
  onNameChange,
  onLevelChange,
  onGoalkeeperInputChange,
  onToggleBulk,
  onBulkTextChange,
  onBulkDefaultLevelChange,
  onProcessBulk,
  onPreviewNameChange,
  onPreviewLevelChange,
  onPreviewGoalkeeperToggle,
  onPreviewRemove,
  onConfirmBulk,
  onReset,
  onRemove,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onEditLevelChange,
  onEditGoalkeeperChange,
}: PlayerPanelProps): React.JSX.Element {
  return (
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
      <form onSubmit={onSubmit}>
        <label htmlFor="player-name" style={{ fontSize: 12, color: "#8FA396", fontWeight: 600, letterSpacing: 0.3 }}>
          NOME DO JOGADOR
        </label>
        <input
          id="player-name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
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
          NIVEL DE FUTEBOL
        </label>
        <LevelPicker value={level} onChange={onLevelChange} />

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
            onChange={(event) => onGoalkeeperInputChange(event.target.checked)}
            style={{ width: 15, height: 15, accentColor: "#E8B923" }}
          />
          <Hand size={13} color="#8FA396" /> É goleiro
        </label>

        {error && <p style={{ color: "#FF6B4A", fontSize: 12.5, marginTop: 10, marginBottom: 0 }}>{error}</p>}

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
        onClick={onToggleBulk}
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
        {bulkOpen ? "Fechar importacao de lista" : "Colar lista do WhatsApp"}
      </button>

      {bulkOpen && (
        <BulkImportPanel
          text={bulkText}
          defaultLevel={bulkDefaultLevel}
          message={bulkMessage}
          preview={preview}
          onTextChange={onBulkTextChange}
          onDefaultLevelChange={onBulkDefaultLevelChange}
          onProcess={onProcessBulk}
          onPreviewNameChange={onPreviewNameChange}
          onPreviewLevelChange={onPreviewLevelChange}
          onPreviewGoalkeeperToggle={onPreviewGoalkeeperToggle}
          onPreviewRemove={onPreviewRemove}
          onConfirm={onConfirmBulk}
        />
      )}

      <PlayerList
        players={players}
        editingId={editingId}
        editName={editName}
        editLevel={editLevel}
        editGoalkeeper={editGoalkeeper}
        editError={editError}
        onReset={onReset}
        onRemove={onRemove}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
        onEditNameChange={onEditNameChange}
        onEditLevelChange={onEditLevelChange}
        onEditGoalkeeperChange={onEditGoalkeeperChange}
      />
    </div>
  );
}
