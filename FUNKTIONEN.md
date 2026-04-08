# LifeRPG – Funktionsübersicht (Stand: April 2026)

Diese Datei beschreibt die aktuell vorhandenen Funktionen der App **LifeRPG** in übersichtlicher Form.

## 1) Einstieg & Konto

- **Startseite** mit kurzer Produktbeschreibung und CTA-Buttons für Registrierung/Login.
- **Registrierung** neuer Nutzer.
- **Login** bestehender Nutzer.
- **Logout** direkt aus dem Dashboard.
- Geschützte Seiten leiten ohne Login automatisch auf `/login` weiter.

## 2) Dashboard

Das Dashboard ist die zentrale Übersicht und zeigt:

- Begrüßung mit Nutzername
- **Globales Level** und aktueller **XP-Fortschritt**
- **Gold** (Ingame-Währung)
- **Punkte**
- Aufteilung in:
  - **Alle Tasks**
  - **Alle Gewohnheiten**
- Übersicht der **Attribut-Level**
- Anzahl der aktuell angelegten **Skills**
- Liste freigeschalteter **Achievements**
- Schnellnavigation zu:
  - Task-/Gewohnheit erstellen
  - Profilseite
  - Skill-Verwaltung (Settings)

## 3) Task- und Gewohnheitssystem

### 3.1 Erstellen

Nutzer können Einträge erstellen als:

- **Task** (klassische Aufgabe)
- **Gewohnheit** (wiederkehrend)

Beim Erstellen sind u. a. folgende Werte möglich:

- Titel
- XP-Wert
- Punkte-Wert
- Optionaler Skill-Bezug
- Skill-XP-Belohnung
- Attribut-XP-Belohnungen (pro Attribut)
- Bei Tasks optionales Fälligkeitsdatum
- Bei Gewohnheiten Wochentage + Zielhäufigkeit pro Woche

### 3.2 Abschließen

Beim Abschließen wird je nach Typ geprüft:

- **Task**: nur einmal abschließbar
- **Gewohnheit**:
  - nur an fälligen Tagen abschließbar
  - nur einmal pro Tag
  - respektiert Wochenziel (z. B. 3x pro Woche)

Nach erfolgreichem Abschluss:

- Task/Gewohnheit wird als erledigt markiert
- Profil erhält XP/Punkte/Gold
- Attribute erhalten XP
- Zugeordneter Skill erhält XP (falls gesetzt)
- Streak wird aktualisiert
- Neue Achievements werden automatisch geprüft und ggf. freigeschaltet

## 4) RPG-Progression

### 4.1 Globales Levelsystem

- XP-Schwelle pro Level skaliert mit Level (`GLOBAL_XP_BASE * aktuelles Level`).
- Mehrere Level-Ups in einem Schritt sind möglich.
- Level-Up belohnt zusätzlich mit Gold.

### 4.2 Attribute

Aktuelle Attribute:

- Stärke
- Fokus
- Wissen
- Ausdauer
- Disziplin
- Charisma

Für jedes Attribut gibt es:

- eigenes Level
- eigene XP
- eigenen Fortschrittsbalken
- Gold-Belohnung bei Attribut-Level-Up

### 4.3 Skills

- Nutzer können eigene **Skills** (trainierbare Lebensbereiche) anlegen.
- Skill enthält u. a. Name, Beschreibung, Icon/Farbe, primäres und optional sekundäres Attribut.
- Skills können erstellt, bearbeitet und gelöscht werden.
- Beim Löschen werden Referenzen in Tasks/Gewohnheiten bereinigt (Skill-Verknüpfung entfernt).
- Skill-XP aus Tasks/Gewohnheiten kann Skill-Level erhöhen.

## 5) Achievements & Streaks

Aktuell implementierte Achievement-Regeln:

- **First Blood**: erstes Task abgeschlossen
- **Momentum**: 5 Tasks abgeschlossen
- **Hero Rank**: Level 5 erreicht
- **On Fire**: 3-Tage-Streak erreicht

Streak-Logik:

- gleiche Tagesabschlüsse erhöhen die Streak nicht doppelt
- Abschluss am Folgetag erhöht die Streak
- längere Lücke setzt die Streak zurück

## 6) Profilseite

Die Profilseite enthält:

- Profilkopf mit Avatar, Name, Rangtitel, Level, XP und Gold
- Visualisierung der Attribute als Radar-Chart
- Detailkarten pro Attribut (Level, XP, Rest-XP)
- Avatar-Auswahl
- Achievement-Grid

Rangtitel (aktuell):

- ab Level 1: **Novize**
- ab Level 10: **Abenteurer**
- ab Level 20: **Champion**

## 7) Settings / Skill-Verwaltung

In den Settings können Nutzer:

- Skills anlegen
- Skills bearbeiten
- Skills löschen
- Primäre/sekundäre Attributzuordnung der Skills festlegen

Damit wird gesteuert, welche Lebensbereiche gezielt trainiert werden und wie Aufgaben auf die Progression einzahlen.

## 8) API-Endpunkte (intern genutzt)

- `POST /api/tasks` – erstellt Task/Gewohnheit
- `POST /api/tasks/[id]/complete` – schließt Task/Gewohnheit ab und triggert Rewards/Streak/Achievements
- `GET /api/skills` – lädt Skills des Nutzers
- `POST /api/skills` – erstellt Skill
- `PATCH /api/skills/[id]` – aktualisiert Skill
- `DELETE /api/skills/[id]` – löscht Skill
- `POST /api/auth/logout` – Logout

## 9) Technischer Hinweis

Die App nutzt **Next.js (App Router)** + **Supabase** (Auth + Datenbank). Ein Teil der Logik ist serverseitig umgesetzt, insbesondere Auth-Prüfung sowie Abschluss- und Reward-Berechnung.
