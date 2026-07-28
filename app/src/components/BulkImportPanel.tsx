"use client";

import { Check, Hand, X } from "lucide-react";
import type { Level, ParsedPlayer } from "../domain/types";
import { LevelPicker } from "./LevelPicker";

interface BulkImportPanelProps {
  text: string;
  defaultLevel: Level;
  message: string;
  preview: ParsedPlayer[] | null;
  onTextChange: (text: string) => void;
  onDefaultLevelChange: (level: Level) => void;
  onProcess: () => void;
  onPreviewNameChange: (id: string, name: string) => void;
  onPreviewLevelChange: (id: string, level: Level) => void;
  onPreviewGoalkeeperToggle: (id: string) => void;
  onPreviewRemove: (id: string) => void;
  onConfirm: () => void;
}

export function BulkImportPanel({
  text,
  defaultLevel,
  message,
  preview,
  onTextChange,
  onDefaultLevelChange,
  onProcess,
  onPreviewNameChange,
  onPreviewLevelChange,
  onPreviewGoalkeeperToggle,
  onPreviewRemove,
  onConfirm,
}: BulkImportPanelProps): React.JSX.Element {
  return (
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
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
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
        NIVEL PADRAO PARA LINHAS SEM NIVEL IDENTIFICADO
      </label>
      <LevelPicker value={defaultLevel} onChange={onDefaultLevelChange} compact />

      <button
        type="button"
        onClick={onProcess}
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

      {message && (
        <p style={{ fontSize: 12, color: "#B4E23D", marginTop: 8, marginBottom: 0 }}>{message}</p>
      )}

      {preview && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 11.5, color: "#8FA396", margin: "0 0 8px" }}>
            Confira antes de adicionar - ajuste nome ou nivel se precisar:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
            {preview.map((player) => (
              <div
                key={player.id}
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  background: "rgba(244,241,232,0.03)",
                  borderRadius: 8,
                  padding: 6,
                  border: player.matched
                    ? "1px solid rgba(244,241,232,0.08)"
                    : "1px solid rgba(232,185,35,0.35)",
                }}
              >
                <input
                  value={player.name}
                  onChange={(event) => onPreviewNameChange(player.id, event.target.value)}
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
                <LevelPicker value={player.level} onChange={(level) => onPreviewLevelChange(player.id, level)} compact />
                <button
                  type="button"
                  onClick={() => onPreviewGoalkeeperToggle(player.id)}
                  aria-pressed={player.isGoalkeeper}
                  title="Marcar como goleiro"
                  style={{
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    border: player.isGoalkeeper
                      ? "1.5px solid #E8B923"
                      : "1.5px solid rgba(244,241,232,0.14)",
                    background: player.isGoalkeeper ? "rgba(232,185,35,0.14)" : "transparent",
                    color: player.isGoalkeeper ? "#E8B923" : "#8FA396",
                    cursor: "pointer",
                  }}
                >
                  <Hand size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onPreviewRemove(player.id)}
                  aria-label={`Remover ${player.name} da lista`}
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
            Linhas com borda amarela tiveram o nivel preenchido no padrao - nao foi identificado no texto.
          </p>
          <button
            type="button"
            onClick={onConfirm}
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
  );
}
