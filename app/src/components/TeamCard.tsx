"use client";

import { Hand } from "lucide-react";
import { JERSEYS, levelInfo } from "../domain/constants";
import type { Team } from "../domain/types";

export function TeamCard({ team, index }: { team: Team; index: number }): React.JSX.Element {
  const jersey = JERSEYS[index % JERSEYS.length];
  const average = team.players.length ? (team.total / team.players.length).toFixed(1) : "0.0";

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
            {team.players.length} jogador{team.players.length !== 1 ? "es" : ""} - nivel medio {average}
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
          .map((player) => {
            const info = levelInfo(player.level);
            return (
              <li
                key={player.id}
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
                  {player.name}
                  {player.isGoalkeeper && (
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
                <span style={{ fontSize: 11, color: "#8FA396", fontWeight: 600 }}>{info.short}</span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
