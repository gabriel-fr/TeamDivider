"use client";

import type { Team } from "../domain/types";

export function BalanceMeter({ teams }: { teams: Team[] }): React.JSX.Element | null {
  if (teams.length !== 2) return null;

  const [firstTeam, secondTeam] = teams;
  const totalSum = firstTeam.total + secondTeam.total || 1;
  const firstTeamPercent = (firstTeam.total / totalSum) * 100;
  const difference = Math.abs(firstTeam.total - secondTeam.total);

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
        <span>FORCA TIME 1 - {firstTeam.total}</span>
        <span>FORCA TIME 2 - {secondTeam.total}</span>
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
            width: `${firstTeamPercent}%`,
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
          color: difference <= 1 ? "#B4E23D" : "#E8B923",
          fontWeight: 600,
        }}
      >
        {difference <= 1 ? "Times equilibrados" : `Diferenca de ${difference} ponto(s) de nivel`}
      </p>
    </div>
  );
}
