import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life RPG",
  description: "Gamify your real life with XP, levels, and achievements"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
