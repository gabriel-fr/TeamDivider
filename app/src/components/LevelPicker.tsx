"use client";

import { LEVELS } from "../domain/constants";
import type { Level } from "../domain/types";

interface LevelPickerProps {
  value: Level;
  onChange: (value: Level) => void;
  compact?: boolean;
}

export function LevelPicker({ value, onChange, compact }: LevelPickerProps): React.JSX.Element {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {LEVELS.map((level) => {
        const active = value === level.value;
        return (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
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
            {level.short}
          </button>
        );
      })}
    </div>
  );
}
