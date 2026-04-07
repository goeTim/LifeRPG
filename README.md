# Life RPG (MVP)

Life RPG ist eine Gamification-Web-App auf Basis von **Next.js + Supabase**. Nutzer entwickeln ihren Alltag wie einen RPG-Charakter: Tasks erledigen, XP sammeln, leveln, Attribute steigern und Achievements freischalten.

## Tech Stack

- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS (Dark UI)
- Supabase (Auth + Postgres)
- Deployment-ready für Vercel

## Architektur (Kurz)

- **Frontend/UI:** `app/` + `components/`
- **Business-Logik:** `lib/leveling.ts`, `lib/achievements.ts`
- **Datenzugriff:** Supabase Server/Browser Client in `lib/supabase-*.ts`
- **Persistenz:** Supabase Schema + Seeds in `supabase/`

## Setup

1. Dependencies installieren:
   ```bash
   npm install
   ```
2. Umgebungsvariablen setzen:
   ```bash
   cp .env.example .env.local
   ```
   Werte aus deinem Supabase-Projekt eintragen.
3. Supabase Schema ausführen:
   - `supabase/schema.sql`
4. Seed ausführen:
   - `supabase/seed.sql`
5. Dev-Server starten:
   ```bash
   npm run dev
   ```

## Projektstruktur

```txt
app/
  (auth)/login
  (auth)/register
  api/
    auth/logout
    tasks
    tasks/[id]/complete
  dashboard
components/
lib/
supabase/
types/
```

## MVP Features

- Registrierung/Login via Supabase Auth
- Profile mit Level, XP, Attributen
- Task-Erstellung (Kategorie, XP, optionaler Attribut-Bonus)
- Task-Abschluss triggert XP/Level-Up + Attributsteigerung
- Achievement-Regeln:
  - Erstes Task
  - 5 abgeschlossene Tasks
  - Level 5
  - 3-Tage-Streak
- Dashboard mit XP-Balken, Attributen, heutigen Tasks, Achievements
- Responsive Dark Theme UI

## Deployment auf Vercel

1. Repo auf GitHub pushen
2. In Vercel importieren
3. Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) setzen
4. Deploy

