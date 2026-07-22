import { getDb } from "./db";

export type PartyMemberItem = {
  itemSlot: number;
  itemId: number;
};

export type PartyMember = {
  partyId: number;
  slot: number;
  pokemonId: number;
  items: PartyMemberItem[];
};

export type Party = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: PartyMember[];
};

export type PartyMemberInput = {
  slot: number;
  pokemonId: number;
};

type PartyRow = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type MemberRow = {
  partyId: number;
  slot: number;
  pokemonId: number;
};

type ItemRow = {
  partyId: number;
  slot: number;
  itemSlot: number;
  itemId: number;
};

function nowIso(): string {
  return new Date().toISOString();
}

function touchParty(partyId: number): void {
  getDb()
    .prepare(`UPDATE parties SET updatedAt = ? WHERE id = ?`)
    .run(nowIso(), partyId);
}

function validateMembers(members: PartyMemberInput[]): string | null {
  if (members.length > 6) {
    return "파티 멤버는 최대 6마리입니다.";
  }

  const slots = new Set<number>();
  for (const member of members) {
    if (!Number.isInteger(member.slot) || member.slot < 1 || member.slot > 6) {
      return "슬롯은 1부터 6까지여야 합니다.";
    }
    if (!Number.isInteger(member.pokemonId) || member.pokemonId < 1) {
      return "유효한 포켓몬 ID가 필요합니다.";
    }
    if (slots.has(member.slot)) {
      return "슬롯이 중복되었습니다.";
    }
    slots.add(member.slot);
  }

  return null;
}

function getItemsForParty(partyId: number): Map<number, PartyMemberItem[]> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT partyId, slot, itemSlot, itemId
       FROM party_member_items
       WHERE partyId = ?
       ORDER BY slot ASC, itemSlot ASC`,
    )
    .all(partyId) as ItemRow[];

  const bySlot = new Map<number, PartyMemberItem[]>();
  for (const row of rows) {
    const list = bySlot.get(row.slot) ?? [];
    list.push({ itemSlot: row.itemSlot, itemId: row.itemId });
    bySlot.set(row.slot, list);
  }
  return bySlot;
}

function clearItemsForSlot(partyId: number, slot: number): void {
  getDb()
    .prepare(
      `DELETE FROM party_member_items WHERE partyId = ? AND slot = ?`,
    )
    .run(partyId, slot);
}

function getMembersForParty(partyId: number): PartyMember[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT partyId, slot, pokemonId
       FROM party_members
       WHERE partyId = ?
       ORDER BY slot ASC`,
    )
    .all(partyId) as MemberRow[];

  const itemsBySlot = getItemsForParty(partyId);

  return rows.map((row) => ({
    partyId: row.partyId,
    slot: row.slot,
    pokemonId: row.pokemonId,
    items: itemsBySlot.get(row.slot) ?? [],
  }));
}

function replaceMembers(partyId: number, members: PartyMemberInput[]): void {
  const db = getDb();
  db.prepare(`DELETE FROM party_members WHERE partyId = ?`).run(partyId);

  const insert = db.prepare(
    `INSERT INTO party_members (partyId, slot, pokemonId)
     VALUES (?, ?, ?)`,
  );

  for (const member of members) {
    insert.run(partyId, member.slot, member.pokemonId);
  }
}

export function listParties(): Party[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, createdAt, updatedAt
       FROM parties
       ORDER BY id DESC`,
    )
    .all() as PartyRow[];

  return rows.map((row) => ({
    ...row,
    members: getMembersForParty(row.id),
  }));
}

export function getParty(id: number): Party | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, name, createdAt, updatedAt
       FROM parties
       WHERE id = ?`,
    )
    .get(id) as PartyRow | undefined;

  if (!row) return null;

  return {
    ...row,
    members: getMembersForParty(row.id),
  };
}

export function createParty(
  name: string,
  members: PartyMemberInput[] = [],
): { party: Party } | { error: string } {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: "파티 이름이 필요합니다." };
  }

  const memberError = validateMembers(members);
  if (memberError) return { error: memberError };

  const db = getDb();
  const createdAt = nowIso();

  db.exec("BEGIN");
  try {
    const result = db
      .prepare(
        `INSERT INTO parties (name, createdAt, updatedAt)
         VALUES (?, ?, ?)`,
      )
      .run(trimmedName, createdAt, createdAt);

    const partyId = Number(result.lastInsertRowid);
    replaceMembers(partyId, members);
    db.exec("COMMIT");

    const party = getParty(partyId);
    if (!party) return { error: "파티 생성 후 조회에 실패했습니다." };
    return { party };
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("파티 생성 오류:", error);
    return { error: "파티를 생성하지 못했습니다." };
  }
}

export function updateParty(
  id: number,
  input: { name?: string; members?: PartyMemberInput[] },
): { party: Party } | { error: string; status?: number } {
  const existing = getParty(id);
  if (!existing) {
    return { error: "파티를 찾을 수 없습니다.", status: 404 };
  }

  let nextName = existing.name;
  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return { error: "파티 이름이 필요합니다.", status: 400 };
    }
    nextName = trimmedName;
  }

  let nextMembers: PartyMemberInput[] = existing.members.map((member) => ({
    slot: member.slot,
    pokemonId: member.pokemonId,
  }));

  if (input.members !== undefined) {
    const memberError = validateMembers(input.members);
    if (memberError) return { error: memberError, status: 400 };
    nextMembers = input.members;
  }

  const db = getDb();
  const updatedAt = nowIso();

  db.exec("BEGIN");
  try {
    db.prepare(
      `UPDATE parties SET name = ?, updatedAt = ? WHERE id = ?`,
    ).run(nextName, updatedAt, id);

    if (input.members !== undefined) {
      replaceMembers(id, nextMembers);
    }

    db.exec("COMMIT");

    const party = getParty(id);
    if (!party) {
      return { error: "파티 수정 후 조회에 실패했습니다.", status: 500 };
    }
    return { party };
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("파티 수정 오류:", error);
    return { error: "파티를 수정하지 못했습니다.", status: 500 };
  }
}

export function deleteParty(id: number): { ok: true } | { error: string; status: number } {
  const existing = getParty(id);
  if (!existing) {
    return { error: "파티를 찾을 수 없습니다.", status: 404 };
  }

  getDb().prepare(`DELETE FROM parties WHERE id = ?`).run(id);
  return { ok: true };
}

export function assignPartySlot(
  partyId: number,
  slot: number,
  pokemonId: number,
): { party: Party } | { error: string; status: number } {
  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    return { error: "슬롯은 1부터 6까지여야 합니다.", status: 400 };
  }
  if (!Number.isInteger(pokemonId) || pokemonId < 1) {
    return { error: "유효한 포켓몬 ID가 필요합니다.", status: 400 };
  }

  const existing = getParty(partyId);
  if (!existing) {
    return { error: "파티를 찾을 수 없습니다.", status: 404 };
  }

  const current = existing.members.find((member) => member.slot === slot);
  const db = getDb();

  db.exec("BEGIN");
  try {
    if (current) {
      if (current.pokemonId !== pokemonId) {
        clearItemsForSlot(partyId, slot);
      }
      db.prepare(
        `UPDATE party_members SET pokemonId = ? WHERE partyId = ? AND slot = ?`,
      ).run(pokemonId, partyId, slot);
    } else {
      db.prepare(
        `INSERT INTO party_members (partyId, slot, pokemonId) VALUES (?, ?, ?)`,
      ).run(partyId, slot, pokemonId);
    }
    touchParty(partyId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("슬롯 배정 오류:", error);
    return { error: "슬롯을 배정하지 못했습니다.", status: 500 };
  }

  const party = getParty(partyId);
  if (!party) {
    return { error: "슬롯 배정 후 조회에 실패했습니다.", status: 500 };
  }
  return { party };
}

export function clearPartySlot(
  partyId: number,
  slot: number,
): { party: Party } | { error: string; status: number } {
  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    return { error: "슬롯은 1부터 6까지여야 합니다.", status: 400 };
  }

  const existing = getParty(partyId);
  if (!existing) {
    return { error: "파티를 찾을 수 없습니다.", status: 404 };
  }

  const db = getDb();
  db.exec("BEGIN");
  try {
    clearItemsForSlot(partyId, slot);
    db.prepare(
      `DELETE FROM party_members WHERE partyId = ? AND slot = ?`,
    ).run(partyId, slot);
    touchParty(partyId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("슬롯 비우기 오류:", error);
    return { error: "슬롯을 비우지 못했습니다.", status: 500 };
  }

  const party = getParty(partyId);
  if (!party) {
    return { error: "슬롯 비우기 후 조회에 실패했습니다.", status: 500 };
  }
  return { party };
}

export function getPartySlotItems(
  partyId: number,
  slot: number,
):
  | { items: PartyMemberItem[] }
  | { error: string; status: number } {
  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    return { error: "슬롯은 1부터 6까지여야 합니다.", status: 400 };
  }

  const existing = getParty(partyId);
  if (!existing) {
    return { error: "파티를 찾을 수 없습니다.", status: 404 };
  }

  const member = existing.members.find((m) => m.slot === slot);
  if (!member) {
    return { error: "해당 슬롯에 포켓몬이 없습니다.", status: 404 };
  }

  return { items: member.items };
}

export function addPartyMemberItem(
  partyId: number,
  slot: number,
  itemId: number,
): { party: Party } | { error: string; status: number } {
  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    return { error: "슬롯은 1부터 6까지여야 합니다.", status: 400 };
  }
  if (!Number.isInteger(itemId) || itemId < 1) {
    return { error: "유효한 아이템 ID가 필요합니다.", status: 400 };
  }

  const existing = getParty(partyId);
  if (!existing) {
    return { error: "파티를 찾을 수 없습니다.", status: 404 };
  }

  const member = existing.members.find((m) => m.slot === slot);
  if (!member) {
    return { error: "해당 슬롯에 포켓몬이 없습니다.", status: 400 };
  }

  if (member.items.length >= 3) {
    return { error: "아이템은 최대 3개까지 부여할 수 있습니다.", status: 400 };
  }

  const used = new Set(member.items.map((item) => item.itemSlot));
  let nextItemSlot: number | null = null;
  for (let candidate = 1; candidate <= 3; candidate += 1) {
    if (!used.has(candidate)) {
      nextItemSlot = candidate;
      break;
    }
  }
  if (nextItemSlot === null) {
    return { error: "아이템은 최대 3개까지 부여할 수 있습니다.", status: 400 };
  }

  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare(
      `INSERT INTO party_member_items (partyId, slot, itemSlot, itemId)
       VALUES (?, ?, ?, ?)`,
    ).run(partyId, slot, nextItemSlot, itemId);
    touchParty(partyId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("아이템 추가 오류:", error);
    return { error: "아이템을 추가하지 못했습니다.", status: 500 };
  }

  const party = getParty(partyId);
  if (!party) {
    return { error: "아이템 추가 후 조회에 실패했습니다.", status: 500 };
  }
  return { party };
}

export function removePartyMemberItem(
  partyId: number,
  slot: number,
  itemSlot: number,
): { party: Party } | { error: string; status: number } {
  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    return { error: "슬롯은 1부터 6까지여야 합니다.", status: 400 };
  }
  if (!Number.isInteger(itemSlot) || itemSlot < 1 || itemSlot > 3) {
    return { error: "아이템 슬롯은 1부터 3까지여야 합니다.", status: 400 };
  }

  const existing = getParty(partyId);
  if (!existing) {
    return { error: "파티를 찾을 수 없습니다.", status: 404 };
  }

  const member = existing.members.find((m) => m.slot === slot);
  if (!member) {
    return { error: "해당 슬롯에 포켓몬이 없습니다.", status: 404 };
  }

  const hasItem = member.items.some((item) => item.itemSlot === itemSlot);
  if (!hasItem) {
    return { error: "해당 아이템 슬롯이 비어 있습니다.", status: 404 };
  }

  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare(
      `DELETE FROM party_member_items
       WHERE partyId = ? AND slot = ? AND itemSlot = ?`,
    ).run(partyId, slot, itemSlot);
    touchParty(partyId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("아이템 삭제 오류:", error);
    return { error: "아이템을 삭제하지 못했습니다.", status: 500 };
  }

  const party = getParty(partyId);
  if (!party) {
    return { error: "아이템 삭제 후 조회에 실패했습니다.", status: 500 };
  }
  return { party };
}
