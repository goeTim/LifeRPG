# LifeRPG – Funktionsübersicht (Stand: April 2026)

## 1) Core-System (bestehend)

- Auth (Register/Login/Logout) mit geschützten Seiten.
- Dashboard mit Level, XP, Gold, Punkten, Tasks/Gewohnheiten, Attributen und Achievements.
- Skill-System inkl. Skills erstellen/bearbeiten/löschen.
- Task- und Gewohnheitssystem inkl. Rewards, Streak- und Achievement-Logik.

## 2) Neue Verwaltungszentrale: `/settings`

Die Settings-Seite wurde zu einer **Dashboard-artigen Verwaltungsoberfläche** umgebaut:

- Links: feste Sidebar-Navigation (Desktop) mit aktivem Highlight + Countern.
- Rechts: genau **ein aktiver Verwaltungsbereich** (keine lange Scroll-Liste mehr).
- Mobile: Sidebar per Toggle ein-/ausblendbar.

Sidebar-Bereiche:

- **Progression**: Skills, Rewards, Items
- **Aktivität**: Tasks, Gewohnheiten

Neu eingeführte UI-Bausteine:

- `SettingsPageShell`
- `SettingsSidebar`, `SettingsNavItem`, `CountBadge`
- `SettingsContentLayout`, `SectionHeader`, `EmptyState`, `SearchBar`
- `SkillsManagementPanel`, `RewardsManagementPanel`, `ItemsManagementPanel`
- `TasksManagementPanel`, `HabitsManagementPanel`

## 3) Skills-/Rewards-/Items-Verwaltung (integriert)

Die bestehende CRUD-Logik wurde beibehalten und in das neue Layout integriert:

- **Skills**: Anzeigen, Erstellen, Bearbeiten, Löschen
- **Rewards**: Anzeigen, Erstellen, Bearbeiten, Löschen
- **Items**: Anzeigen, Erstellen, Bearbeiten, Löschen

## 4) Neue Task-Verwaltung in `/settings`

Neuer dedizierter Bereich **Tasks** (aktive, nicht-Habit Tasks):

- Liste aller aktiven Tasks
- Bearbeiten (Titel, globale XP, Skill-XP, Skill-Zuordnung, Due Date, Status)
- Löschen
- Suchfeld für schnelle Filterung

Sichtbare Task-Infos:

- Titel
- globale XP
- zugeordneter Skill (optional)
- Status (offen/abgeschlossen)
- Due Date (falls gesetzt)

## 5) Neue Gewohnheiten-Verwaltung in `/settings`

Neuer dedizierter Bereich **Gewohnheiten** (`is_habit = true`):

- Liste aller aktiven Gewohnheiten
- Bearbeiten (Titel, globale XP, Frequenz/Woche, Tage, Skill-Zuordnung, Skill-XP)
- Löschen
- Suchfeld

Sichtbare Habit-Infos:

- Name/Titel
- Frequenz
- globale XP
- Skill-Zuordnung (optional)
- Status (aktiv)
- Wochenfortschritt (`habit_weekly_completions`)

## 6) API-Endpunkte (erweitert)

Bestehend:

- `GET/POST /api/rewards`
- `PATCH/DELETE /api/rewards/[id]`
- `GET/POST /api/items`
- `PATCH/DELETE /api/items/[id]`
- `POST /api/tasks`
- `POST /api/tasks/[id]/complete`

Neu:

- `PATCH/DELETE /api/tasks/[id]` für Verwaltung von Tasks und Gewohnheiten in `/settings`

## 7) Shop-/Inventory-/Titel-System (bestehend)

Rewards- und Item-Kauf-/Nutzungslogik bleibt unverändert:

- Shop: Wallet-Prüfung + Kaufabwicklung
- Inventory: Aktivieren/Verbrauchen/Setzen Haupttitel
- Profil: Anzeige Haupttitel + aktive Titel

## 8) Datenmodell (unverändert genutzt)

Keine neuen Tabellen nötig für den Umbau.
Die neue Settings-Verwaltung nutzt weiterhin:

- `skills`
- `custom_rewards`
- `shop_items`
- `tasks` (inkl. Habit-Felder)

## 9) UX-Verbesserungen

- Klare Navigation statt langer Verwaltungsseite
- Aktiver Bereich visuell hervorgehoben
- Leere Zustände je Bereich (`EmptyState`)
- Counter pro Sidebar-Eintrag (z. B. `Tasks (12)`)
- Mobile-freundliches Navigationsverhalten
