# LifeRPG – Funktionsübersicht (Stand: April 2026)

## 1) Core-System (bestehend)

- Auth (Register/Login/Logout) mit geschützten Seiten.
- Dashboard mit Level, XP, Gold, Punkten, Tasks/Gewohnheiten, Attributen und Achievements.
- Skill-System inkl. Skills erstellen/bearbeiten/löschen.
- Task- und Gewohnheitssystem inkl. Rewards, Streak- und Achievement-Logik.

## 2) Neue Verwaltungszentrale: `/settings`

Die Settings-Seite ist jetzt der zentrale Admin-Bereich der App:

- **Skills verwalten** (bestehend, unverändert integriert)
- **Rewards verwalten**
  - Anzeigen
  - Erstellen
  - Bearbeiten
  - Löschen
- **Items verwalten**
  - Anzeigen
  - Erstellen
  - Bearbeiten
  - Löschen

Neu eingeführte UI-Bausteine:

- `SettingsSection`
- `RewardsSettingsList` + `RewardForm`
- `ItemsSettingsList` + `ItemForm`

## 3) Rewards-System

Rewards sind user-spezifische reale Belohnungen (z. B. „1 Stunde Gaming“):

- Werden in `/settings` gepflegt (`custom_rewards`).
- Sind in `/shop` kaufbar.
- Landen im Inventar (`inventory_items` mit `reward_id`).
- Sind **stackbar** (Mehrfachkauf erhöht `quantity`).
- Beim Einlösen in `/inventory` wird `quantity` um 1 reduziert.
- Bei `quantity <= 0` wird der Inventar-Eintrag entfernt.

## 4) Ingame-Items-System

Items werden in `shop_items` gespeichert und unterstützen folgende Typen:

- `consumable` (stackbar + verbrauchbar)
- `cosmetic` (dauerhaft + aktivierbar)
- `title` (dauerhaft + aktivierbar + Haupttitel möglich)
- `unlockable` (dauerhaft freigeschaltet)

Konfigurierbare Felder:

- `name`, `description`, `icon`
- `cost_gold`, `cost_points`
- `item_type`, `rarity`, `color`
- `is_stackable`, `is_consumable` (automatisch aus `item_type` gesetzt)

## 5) Shop: `/shop`

Der Shop zeigt:

- aktuelles Gold
- aktuelle Punkte
- kaufbare Bereiche:
  - Rewards
  - Consumables
  - Cosmetics
  - Titles
  - Unlockables

Kauf-Logik:

- Kaufprüfung auf Gold/Punkte (`canAfford`)
- Wallet-Abzug (`deductWallet`)
- Inventar-Update je nach Typ (stacken oder dauerhaft einmalig)

Neue Shop-Komponenten:

- `ShopHeader`
- `ShopGrid`
- `ShopItemCard`
- `PurchaseButton`

## 6) Inventory: `/inventory`

Inventar zeigt alle gekauften Dinge mit:

- Name, Typ, Icon, Beschreibung
- `quantity`
- aktiv/inaktiv Status (wo relevant)

Verhalten:

- Rewards: einlösbar (verbrauchen)
- Consumables: benutzbar (verbrauchen)
- Cosmetics: aktivierbar/deaktivierbar
- Titles: aktivierbar/deaktivierbar + Haupttitel setzen
- Unlockables: dauerhaft vorhanden

Neue Inventory-Komponenten:

- `InventoryGrid`
- `InventoryItemCard`
- `TitleManager`

## 7) Titel-System & Profil

Titel-Logik:

- Mehrere Titel können besessen werden.
- Mehrere Titel können gleichzeitig aktiv sein.
- Es gibt genau **einen Haupttitel** (`is_main_title`).
- Setzen eines neuen Haupttitels ersetzt den alten.

Profil-Erweiterung (`/profile`):

- Haupttitel wird direkt neben dem Nutzernamen angezeigt.
- Abschnitt **„Titel“** zeigt alle aktiven Titel außer Haupttitel.
- Bestehende Profilinhalte bleiben erhalten (Radar, Attribute, Avatar, Achievements).

## 8) Datenmodell (neu)

Neue Tabellen:

- `shop_items`
- `custom_rewards`
- `inventory_items`
- `inventory_history` (optional, hier integriert)

Wichtige Modellregeln:

- `inventory_items` referenziert **entweder** `shop_item_id` **oder** `reward_id` (Check-Constraint).
- Unique-Indices für `(user_id, shop_item_id)` und `(user_id, reward_id)` verhindern unnötige Duplikate.
- RLS-Policies sichern alle neuen Tabellen auf den Owner ein (mit global lesbaren Seed-Shop-Items via `user_id is null`).

## 9) Seed-Daten

Seed ergänzt um globale Shop-Items:

- Consumables: z. B. `Energy Drink`, `Focus Potion`
- Cosmetic: `Neon Aura`
- Titles: `Novize`, `Scholar`, `Champion`, `Disziplinierter`
- Unlockable: `Golden Theme`

User-spezifische Rewards sind absichtlich im Seed als Beispiel-Kommentar enthalten und werden i. d. R. pro User in Settings angelegt.

## 10) Business-Logik / Helper

Zentrale neue Helper:

- `lib/inventory.ts`
  - Kaufprüfung
  - Wallet-Abzug
  - Item-Verhalten (stackbar/consumable)
  - Inventory-Metadaten
- `lib/inventory-service.ts`
  - Kauf von Rewards/Items
  - Inventar-Update
  - Verbrauchslogik
  - Inventar-Laden

## 11) API-Endpunkte (neu)

- `GET/POST /api/rewards`
- `PATCH/DELETE /api/rewards/[id]`
- `GET/POST /api/items`
- `PATCH/DELETE /api/items/[id]`
- `POST /api/shop/purchase`
- `POST /api/inventory/[id]/use`
- `POST /api/inventory/[id]/toggle-active`
- `POST /api/inventory/[id]/set-main-title`
