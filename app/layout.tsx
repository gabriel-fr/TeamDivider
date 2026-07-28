import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Team Divider",
  description: "Sorteador de times equilibrados",
};

export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, minHeight: "100vh", background: "#0F2818" }}>{children}</body>
    </html>
  );
}
