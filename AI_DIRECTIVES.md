# System Builder — AI Directives

> These directives apply to **all AI assistants** (Claude, GitHub Copilot, etc.) working on this project.
> Last updated: 2026-03-23

---

## Project Overview

| | |
|---|---|
| **Working Title** | System Builder *(will change)* |
| **Type** | Web-based SPA + API backend |
| **Genre** | Incremental / idle node-graph builder |
| **Progression** | Prestige-based with a story end goal; effectively endless |

Players arrange **Cards** on a pannable desktop, connect them with lines, and build resource **Chains**. Resources flow through chains continuously or in ticks. The goal is to optimize chains, unlock new cards, and progress through a narrative arc with prestige replay.

---

## Vocabulary

These terms are canonical. Use them exactly in code, types, comments, and conversation. Do not invent synonyms.

| Term | Definition |
|------|------------|
| **Desktop** | The infinite pannable workspace the player interacts with |
| **Grid** | The finite tile-based build surface within the Desktop; starts small, expandable via upgrades |
| **Card** | A single node/unit. Has a title, zero or more Inputs, zero or more Outputs |
| **Input** | A connection port on the **left** side of a Card; multiple Inputs fill **top-down** |
| **Output** | A connection port on the **right** side of a Card; multiple Outputs fill **bottom-up** |
| **Connection** | A directed edge (drawn as a line) from one Card's Output to another Card's Input |
| **Chain** | A sequence of connected Cards through which resources flow |
| **Primary Chain** | A Chain that originates from a Generator Card (no inputs required) |
| **Flow** | The movement of a resource through a Connection |
| **Pool** | Resource accumulation at a Card when downstream flow is interrupted, or when a downstream Card cannot process inputs fast enough; default behavior for most Cards |
| **Cycle** | A Chain that loops back on itself — permitted only in specific Card types or designated scenarios |
| **Generator** | Card archetype — no Inputs; produces resources continuously or in ticks |
| **Refiner** | Card archetype — transforms or upgrades a resource |
| **Seller** | Card archetype — consumes a resource, produces currency or points |
| **Splitter** | Card archetype — divides a single Input Flow into multiple Output Flows |
| **Storage** | Card archetype — buffers and holds pooled resources |
| **Converter** | Card archetype — accepts 2+ Inputs and produces a different Output |
| **Prestige** | Meta-progression mechanic: a soft reset that applies selected Tech Tree items, granting permanent bonuses; exact design TBD |
| **Tech Tree** | A tree of unlockable bonuses purchased with Research Points; selections are applied upon Prestige reset |
| **Coin** | Primary spendable currency; produced by Seller Cards |
| **XP** | Experience points that can be scoped to a specific Card instance **or** to all Cards of a given type (e.g., all Wood Refiners level collectively) |
| **Research Points** | Unlock currency; produced by certain Seller Cards; may have subtypes |
| **Local Save** | Game state persisted in the browser (IndexedDB); always present, always the primary source of truth |
| **Cloud Save** | A copy of Local Save synced to Cloudflare D1; available only to logged-in users who have enabled it |
| **Device ID** | A unique identifier generated once per browser/device instance; stored in IndexedDB; used for active device tracking and sync |
| **Sync** | The act of pushing Local Save to Cloud Save or pulling Cloud Save to local; triggered automatically for logged-in users |
| **Save Conflict** | State where a device's Local Save and the current Cloud Save have diverged and cannot be merged automatically |
| **Save Snapshot** | A summary of save state metadata shown to the user during conflict resolution (device name, last active time, progress indicators) |
| **Kill Flag** | A signal written to Cloudflare KV when a device's save is rejected during conflict resolution; instructs that device to pause sync and notify the user |

> Additional card archetypes and currency types are expected. The above list is not exhaustive.

---

## Tech Stack

### Confirmed
- **Language:** TypeScript — strict mode required, front end and back end
- **App type:** Single Page Application (SPA)
- **Frontend framework:** Vue 3
- **Node graph UI:** Vue Flow
- **State management:** Pinia — setup store style only (not options style); four focused stores (see below)
- **Schema validation:** Zod — at data boundaries only (see Zod Rules below)
- **Database ORM:** Drizzle ORM + drizzle-kit + drizzle-zod
- **Backend:** Hono on Cloudflare Workers
- **Project structure:** Monorepo — `src/app` (Vue), `src/api` (Hono), `src/packages/*` (shared)
- **Package manager:** pnpm — workspace config via `pnpm-workspace.yaml`
- **Build tooling:** Vite
- **Auth:** Hanko — optional login; passkey-based
- **Cloud persistence:** Cloudflare D1 (Cloud Saves), Cloudflare KV (card catalog, device presence)
- **Deployment:** Cloudflare — both frontend (Pages) and backend (Workers)
- **Architecture pattern:** Local-first hybrid (see Save & Sync Architecture below)

### Project Structure
```
src/
  app/                    # Vue 3 SPA
    engine/               # Pure TS game engine — no framework imports
    stores/               # Pinia stores (useUserStore, useGameStore, useBoardStore, useSimStore)
    components/           # Vue components
    composables/          # Shared Vue composables

  api/                    # Hono Worker
    routes/               # save, device, catalog, version
    middleware/           # Hanko auth, logging, CORS

  packages/               # Shared internal packages — each has own package.json
    schemas/              # Zod schemas for API payloads, save JSON, auth
    db/                   # Drizzle schema, drizzle-zod, DB client
      migrations/         # drizzle-kit generated SQL — never hand-written
    types/                # Shared TS types not derivable from schemas — keep very thin
    constants/            # Named constants used by both app and api
```

### Not Yet Decided
- Nothing critical — stack is confirmed

### State Stores
Four focused Pinia stores — setup style only. Each store has a single update frequency and a clear ownership boundary.

| Store | Owns | Update frequency |
|---|---|---|
| `useUserStore` | Hanko auth session, Device ID, sync status, API connection state | Rare — login/logout, sync events |
| `useGameStore` | Story progress, prestige history, Tech Tree selections, unlocked card catalog | Rare — prestige, milestones, unlocks |
| `useBoardStore` | Cards on the board, Connections, card positions | Human speed — drag, connect, delete |
| `useSimStore` | Resource pool levels, flow rates, currency totals, XP | Tick speed — every simulation step |

#### Reactivity rules
- `useBoardStore` — cards stored as `Map<CardId, Card>` in a `shallowRef`; trigger manually on internal card state changes; Vue watches the map, not every nested property
- `useSimStore` — individual resource and currency values as flat `ref<number>`; flat is fast; never put the whole simulation state in one deep `reactive({})`
- Never use a single deep `reactive` object for board or simulation state
- Stores may import each other where needed (e.g., `useSimStore` reading card types from `useBoardStore`) — this is expected and supported by Pinia
- User preferences (routing style, theme, sound settings) belong in `useUserStore` — they persist per user and may sync to cloud

### Database

**Stack:** Drizzle ORM + drizzle-kit + drizzle-zod targeting Cloudflare D1 (SQLite)

#### Source of truth chain
```
src/db/schema.ts  →  drizzle-zod  →  Zod schema  →  z.infer<>  →  TypeScript type
```
Never write TypeScript types or Zod schemas for database models by hand — they are always derived from the Drizzle schema.

#### File locations
```
src/db/
  schema.ts        # All Drizzle table definitions — the single source of truth for DB shape
  index.ts         # DB client setup and export
  migrations/      # SQL migration files generated by drizzle-kit — committed to source control
```

#### Rules
- All table definitions live in `src/db/schema.ts` — do not split schema across multiple files unless explicitly requested
- Migrations are **generated by drizzle-kit**, never written by hand: `drizzle-kit generate` produces the SQL, `drizzle-kit migrate` applies it
- Every schema change gets a migration — never mutate D1 directly in production
- `drizzle-zod` schemas for table rows live alongside the DB code in `src/db/`; they are not duplicated in `src/schemas/`
- `src/schemas/` holds Zod schemas for non-DB data (API payloads, save state JSON content, auth data)
- `docs/migrations/` is for **human-readable notes** about why a migration happened — context, decisions, breaking changes; it does not contain SQL files

#### Schema style
```ts
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const saves = sqliteTable('saves', {
  id:              text('id').primaryKey(),
  userId:          text('user_id').notNull(),
  deviceId:        text('device_id').notNull(),
  version:         integer('version').notNull(),
  lastSyncVersion: integer('last_sync_version').notNull(),
  data:            text('data').notNull(), // JSON blob — validated separately by Zod
  createdAt:       integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:       integer('updated_at', { mode: 'timestamp' }).notNull(),
})
```

### Zod Rules

Zod is used **at data boundaries only** — not for internal engine state that never leaves the application.

#### Where Zod is required
| Boundary | Why |
|---|---|
| Loading Local Save from IndexedDB | May be corrupted or an older schema version |
| Pulling Cloud Save from API | Data over the wire — never trust without validation |
| Card definitions loaded from KV | External data source |
| API response payloads (inc. `SAVE_CONFLICT`) | Structured responses must match expected shape |
| Hanko session / user data | External auth data |

#### Where Zod is NOT used
- Internal engine state (pure TS, never serialised)
- Store-to-component data flow (TypeScript types are sufficient)
- Anything that doesn't cross a storage or network boundary

#### Schema location
All Zod schemas live in `src/schemas/` — separate from `src/types/` because schemas are runtime code, not just type annotations.

```
src/schemas/
  save.ts        # Save state schema and version migrations
  card.ts        # Card definition schema (loaded from KV)
  api.ts         # API response schemas (SAVE_CONFLICT, version check, etc.)
  user.ts        # Hanko user / session data
```

#### Types from schemas
Use `z.infer<>` to derive TypeScript types from schemas — do not write parallel manual types for anything that has a Zod schema:

```ts
const SaveV1 = z.object({
  version: z.literal(1),
  cards: z.array(CardSchema),
})
type SaveV1 = z.infer<typeof SaveV1>  // never write this by hand
```

#### Save schema migration
Use Zod's `z.discriminatedUnion('version', [...])` to handle versioned saves explicitly. Each save carries a `version` integer; migrations are transforms, not if/else chains:

```ts
const SaveSchema = z.discriminatedUnion('version', [SaveV1, SaveV2])
// .transform() on each version to normalise to current shape
```

> Do not make implementation assumptions about undecided items. Surface them as open questions when they become relevant.

---

## Architecture Principles

### Card / Graph System
- Cards are the **atomic unit** of gameplay
- Each Card has: a unique ID, an archetype, named Inputs, named Outputs, and internal state
- Connections are **directed**: Output → Input
- The graph is **directed** — resources flow from Outputs to Inputs, never backwards by default
- Most graphs will be **acyclic** (no loops); Cycles are permitted only on specific Card types or in designated scenarios — but cycle detection must be built into the engine from the start to prevent infinite simulation loops
- Game logic (graph engine, flow simulation) must be **framework-agnostic** — pure TypeScript, no DOM or UI framework dependencies

### Flow Model
- Most resources flow **continuously** (real-time rate-based)
- Some resources flow in **discrete ticks or batches**
- Flow rate is a property of the producing Card or the Connection
- Cards may have a pool capacity cap (configurable per Card type)
- When a Connection is removed: flow stops downstream; resources Pool at the disconnected Card by default

### Desktop / Grid
- The **Desktop** is infinite and pannable
- The **Grid** is tile-based, finite, and starts at a fixed size — unlockable expansion via upgrades
- Cards snap to Grid tiles
- Connections are drawn between ports and route automatically; routing style is configurable (e.g., sharp/orthogonal corners, rounded corners, straight/direct)
- When a Card is moved, all of its Connections re-route automatically to follow it

### Progression & Economy
- **Prestige:** players accumulate Research Points, spend them on Tech Tree selections, then reset to apply those bonuses permanently — exact design TBD
- **Card unlocks** are gated by: Research Points, XP thresholds, Coin, story milestones, or available **by default** (no gate)
- Some Cards are free to place; some have unlock or placement costs
- **XP** can be scoped per-Card instance or per-Card type (e.g., all instances of "Wood Refiner" share a type-level XP pool and level collectively)
- Design all currency and unlock systems for extensibility — more types are expected

### Save & Sync Architecture

```
Browser                    Cloudflare Workers (API)      Cloudflare Storage
───────────────────        ────────────────────────      ──────────────────
IndexedDB (Local Save) ──► Save/Sync API (auth'd)  ───► D1  — Cloud Saves, player profiles
  primary source of truth  Version Check API        ───► KV  — Card catalog, device presence
  always written first     Device API
  works fully offline      Hanko Auth integration
```

#### Rules
- **Local Save is always the primary source of truth** — all writes go to IndexedDB first
- **Cloud Save is a mirror** — it is never the authoritative source except on a fresh device with no local data
- **Auth is optional** — the game must be fully playable without logging in; a logged-in state unlocks Cloud Save/Sync only
- **Offline mode:** the game runs normally without API access; a UI indicator (not a blocking error) shows when the API is unreachable; API calls fail silently
- **Auto-sync:** logged-in users sync on session start and on meaningful state changes
- **Device presence:** each device writes a heartbeat to KV while its tab is open (short TTL, ~2-3 min); on tab close, `beforeunload` marks the device inactive explicitly, or the TTL expires naturally
- **Clean handoff (normal case):** user closes laptop tab → device presence expires → user opens phone → no active devices detected → Cloud Save pulled cleanly → seamless
- **Multi-device:** when a logged-in user opens the game on a device with no Local Save, the Cloud Save is pulled to populate it
- **No Durable Objects** — multiplayer is not a consideration; Durable Objects are not part of this architecture

#### Save Versioning
Every save carries two version fields:

| Field | Description |
|-------|-------------|
| `version` | Incrementing integer, increased on every save write |
| `lastSyncVersion` | The `version` value at the last successful cloud sync, stored per device |

Timestamps remain in the save for display purposes (Save Snapshot UI) but are **not** used for conflict logic — they are vulnerable to clock skew.

**Conflict logic using version anchor:**
```
Last sync anchor:  v45
Local now:         v50  (played offline, 5 writes)
Cloud now:         v47  (another device wrote 2 saves)
Both advanced from v45 → genuine SAVE_CONFLICT → prompt user

Last sync anchor:  v45
Local now:         v45  (no local changes)
Cloud now:         v47  → clean pull, no conflict
```

#### Conflict Detection
A Save Conflict only occurs when **two devices are simultaneously active** (both have live heartbeats) **and** their saves have diverged from a common `lastSyncVersion`. This is the only case requiring user intervention.

Detection is the **API's responsibility**:
1. **Session start** — client pings API; API checks KV for other active devices and compares versions; if divergence from a common anchor is found, returns `SAVE_CONFLICT` with both Save Snapshots before gameplay begins
2. **Save attempt** — client pushes save; API validates version ancestry; if diverged, **blocks the write** and returns `SAVE_CONFLICT`; save is never silently overwritten

Heartbeat presence is a **UX signal** ("another tab is open") — conflict detection depends on version ancestry, not presence alone. A device with no active heartbeat cannot cause a conflict.

#### Save Conflict Resolution
Triggered when the API returns `SAVE_CONFLICT`:

1. **Surface a conflict modal** — do not auto-resolve; always require explicit user action
2. **Show a Save Snapshot for each side:**

   | Field | Purpose |
   |-------|---------|
   | Device name / type | Identifies the device (parsed from user agent) |
   | Last active timestamp | When this save was last touched |
   | Last sync timestamp | When it last successfully reached the cloud |
   | Prestige count | Hard progress milestone — easy to compare |
   | Total playtime | Overall investment in this run |
   | Active chain count | How built-out the current board is |
   | Total coin earned (lifetime) | Economy progress proxy |

   > These fields are a starting point. Refine when the save schema is designed.

3. **User selects the winning save** — chosen save is written locally and pushed to Cloud Save
4. **Write a Kill Flag to KV** for the losing Device ID:
   - Key: `kill:{deviceId}`
   - Short TTL (~5-10 min) — only needs to persist long enough for the losing tab to receive it
   - The losing tab is open right now; this is not a long-lived flag
5. **Losing tab response** — detected on its next heartbeat write:
   - Pause auto-sync immediately
   - Surface a notification: *"Another device took over this session. Pull latest save to continue here."*
   - User may: pull the cloud save (accept) or choose to override (triggers a new `SAVE_CONFLICT` on the other device)
   - Kill Flag is cleared once acknowledged
6. **No silent overwrites** — a Kill Flag must never cause automatic data loss without user awareness

### Upgrades
- Card upgrades will be acquired through **Research Points** or purchased with **Coin** — detailed design TBD
- Do not implement an upgrade system speculatively, but do not preclude one structurally

---

## Coding Conventions

- TypeScript strict mode — no `any`, no implicit types
- Clean slate — no conventions inherited from prior projects
- Use Vocabulary table terms directly in type names, variable names, and file names
- No magic numbers — all constants named and centralized
- Separate game logic from rendering strictly
- Design for extensibility; flag premature optimization rather than implementing it
- Small, composable functions and modules over large monolithic structures

---

## Documentation Rules

### Where docs live
All documentation must be stored under `docs/`. Do not create or place documentation files anywhere else in the repository.

```
docs/
  design/       # Game design, system architecture, feature specs, ADRs
  migrations/   # Database schema changes, migration notes, Cloudflare D1 history
```

> AI assistants should use judgment when placing a doc. When in doubt, `design/` is the default. If a new subfolder is genuinely warranted, flag it as a suggestion rather than creating it silently.

### Consent required
- Do **not** generate any documentation file without explicit user instruction
- This includes: README files, architecture docs, API docs, design specs, changelogs, migration notes
- Exception: inline code comments are permitted without consent — they are part of the code, not the docs folder

### File naming
- Use lowercase kebab-case: `card-system-design.md`, `initial-schema.md`
- Include a date prefix for migration docs: `2026-03-23-initial-schema.md`
- Be descriptive — file names should make the content obvious without opening the file

### No doc sprawl
- Do not create `README.md` files in subdirectories unless explicitly requested
- Do not generate `.md` files alongside source files as inline documentation
- Do not create `CHANGELOG.md`, `TODO.md`, `NOTES.md`, or similar files speculatively

---

## What AI Assistants Should NOT Do

- Do not choose or assume a frontend framework until it is confirmed
- Do not assume a specific backend framework or Cloudflare service — these are still being decided
- Do not implement a card upgrade system unless explicitly requested
- Do not add speculative complexity — flag it as a future consideration instead
- Do not rename, redefine, or synonym-ize terms from the Vocabulary table
- Do not couple game logic to any UI framework
- Do not create documentation files without explicit user instruction
- Do not place any `.md` or documentation files outside of `docs/`
- Do not add AI attribution to git commits — no `Co-Authored-By: Claude` or equivalent lines
- Do not commit or push unless explicitly directed by the user
