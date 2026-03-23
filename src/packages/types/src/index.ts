// Shared TypeScript types not derivable from Zod schemas or Drizzle schema.
// Keep this very thin. Before adding here, ask:
//   1. Does it have a DB representation? → derive from Drizzle via drizzle-zod
//   2. Does it cross a network/storage boundary? → define in packages/schemas
//   3. Is it engine-internal? → keep it in src/app/engine/
// Only genuine shared orphans belong here.
