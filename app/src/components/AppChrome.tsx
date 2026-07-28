"use client";

import type { ReactNode } from "react";
import { Trophy } from "lucide-react";

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

export function AppChrome({ children }: { children: ReactNode }): React.JSX.Element {
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
        height: "100vh"
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
      <div style={{ position: "relative", maxWidth: 880, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

export function AppHeader(): React.JSX.Element {
  return (
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
        <Trophy size={13} />
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
        SEPARADOR DE TIMES
      </h1>
      <p style={{ color: "#8FA396", fontSize: 14.5, marginTop: 10 }}>
        Cadastre os jogadores com o nivel de cada um e deixe o algoritmo equilibrar as escalacoes.
      </p>
    </header>
  );
}
