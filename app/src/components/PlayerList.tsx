"use client";

import { Check, Hand, Pencil, RotateCcw, Users, X } from "lucide-react";
import { levelInfo } from "../domain/constants";
import type { Level, Player } from "../domain/types";
import { LevelPicker } from "./LevelPicker";

interface PlayerListProps {
  players: Player[];
  editingId: string | null;
  editName: string;
  editLevel: Level;
  editGoalkeeper: boolean;
  editError: string;
  onReset: () => void;
  onRemove: (id: string) => void;
  onStartEdit: (player: Player) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onEditNameChange: (name: string) => void;
  onEditLevelChange: (level: Level) => void;
  onEditGoalkeeperChange: (updater: (value: boolean) => boolean) => void;
}

export function PlayerList({
  players,
  editingId,
  editName,
  editLevel,
  editGoalkeeper,
  editError,
  onReset,
  onRemove,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onEditLevelChange,
  onEditGoalkeeperChange,
}: PlayerListProps): React.JSX.Element | null {
  if (players.length === 0) return null;

  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(244,241,232,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#8FA396", fontWeight: 600 }}>
          <Users size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
          {players.length} NA LISTA
        </span>
        <button
          type="button"
          onClick={onReset}
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
        {players.map((player) => {
          const info = levelInfo(player.level);
          const isEditing = editingId === player.id;

          if (isEditing) {
            return (
              <li
                key={player.id}
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
                  onChange={(event) => onEditNameChange(event.target.value)}
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
                  <LevelPicker value={editLevel} onChange={onEditLevelChange} compact />
                  <button
                    type="button"
                    onClick={() => onEditGoalkeeperChange((value) => !value)}
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
                      border: editGoalkeeper ? "1.5px solid #E8B923" : "1.5px solid rgba(244,241,232,0.14)",
                      background: editGoalkeeper ? "rgba(232,185,35,0.14)" : "transparent",
                      color: editGoalkeeper ? "#E8B923" : "#8FA396",
                      cursor: "pointer",
                    }}
                  >
                    <Hand size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveEdit(player.id)}
                    aria-label="Salvar edicao"
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
                    onClick={onCancelEdit}
                    aria-label="Cancelar edicao"
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
                  <p style={{ color: "#FF6B4A", fontSize: 11.5, marginTop: 6, marginBottom: 0 }}>{editError}</p>
                )}
              </li>
            );
          }

          return (
            <li
              key={player.id}
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
                {player.name} <span style={{ color: "#8FA396", fontSize: 11.5 }}>- {info.short}</span>
                {player.isGoalkeeper && <span style={{ color: "#E8B923", fontSize: 11, fontWeight: 700 }}> - GOL</span>}
              </span>
              <span style={{ display: "flex", gap: 2, flex: "0 0 auto" }}>
                <button
                  type="button"
                  onClick={() => onStartEdit(player)}
                  aria-label={`Editar ${player.name}`}
                  style={{ background: "none", border: "none", color: "#8FA396", cursor: "pointer", padding: 4, display: "flex" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(player.id)}
                  aria-label={`Remover ${player.name}`}
                  style={{ background: "none", border: "none", color: "#8FA396", cursor: "pointer", padding: 4, display: "flex" }}
                >
                  <X size={14} />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
