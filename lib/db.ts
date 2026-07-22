import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const globalForDb = globalThis as unknown as {
  pokemonDb?: DatabaseSync;
};

function ensureSchema(db: DatabaseSync): void {
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS party_members (
      partyId INTEGER NOT NULL,
      slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 6),
      pokemonId INTEGER NOT NULL,
      PRIMARY KEY (partyId, slot),
      FOREIGN KEY (partyId) REFERENCES parties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS party_member_items (
      partyId INTEGER NOT NULL,
      slot INTEGER NOT NULL,
      itemSlot INTEGER NOT NULL CHECK (itemSlot BETWEEN 1 AND 3),
      itemId INTEGER NOT NULL,
      PRIMARY KEY (partyId, slot, itemSlot),
      FOREIGN KEY (partyId, slot)
        REFERENCES party_members(partyId, slot) ON DELETE CASCADE
    );
  `);
}

function createDatabase(): DatabaseSync {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const db = new DatabaseSync(path.join(dataDir, "pokemon.db"));
  ensureSchema(db);
  return db;
}

export function getDb(): DatabaseSync {
  if (!globalForDb.pokemonDb) {
    globalForDb.pokemonDb = createDatabase();
  } else {
    ensureSchema(globalForDb.pokemonDb);
  }
  return globalForDb.pokemonDb;
}
