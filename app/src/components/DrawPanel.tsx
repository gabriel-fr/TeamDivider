"use client";

import { Hand, Shuffle } from "lucide-react";
import { BalanceMeter } from "./BalanceMeter";
import type { Level, Team } from "../domain/types";

interface DrawPanelProps {
  numTeams: number;
  levelCounts: Record<Level, number>;
  goalkeeperCount: number;
  canDraw: boolean;
  teams: Team[] | null;
  onNumTeamsChange: (numTeams: number) => void;
  onDraw: () => void;
}

export function DrawPanel({
  numTeams,
  levelCounts,
  goalkeeperCount,
  canDraw,
  teams,
  onNumTeamsChange,
  onDraw,
}: DrawPanelProps): React.JSX.Element {
  return (
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
          {[2, 3, 4].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onNumTeamsChange(option)}
              aria-pressed={numTeams === option}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: numTeams === option ? "1.5px solid #E8B923" : "1.5px solid rgba(244,241,232,0.14)",
                background: numTeams === option ? "rgba(232,185,35,0.14)" : "transparent",
                color: numTeams === option ? "#E8B923" : "#C9D1C6",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {option}
            </button>
          ))}
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
          {goalkeeperCount} goleiro{goalkeeperCount !== 1 ? "s" : ""} cadastrado{goalkeeperCount !== 1 ? "s" : ""}
          {goalkeeperCount < numTeams && ` - faltam ${numTeams - goalkeeperCount} para garantir 1 por time`}
        </div>

        <button
          type="button"
          onClick={onDraw}
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
          <span style={{ fontSize: 11.5, color: "#8FA396", fontWeight: 600, letterSpacing: 0.3 }}>EQUILIBRIO</span>
          <div style={{ marginTop: 10 }}>
            <BalanceMeter teams={teams} />
          </div>
        </div>
      )}
    </div>
  );
}
