import fs from "node:fs";
import path from "node:path";
import type { ItemSearchEntry } from "./itemSearch";

export type { ItemSearchEntry };

type NamedLanguage = {
  name: string;
  language: { name: string };
};

type ItemListApi = {
  count: number;
  results: { name: string; url: string }[];
};

type ItemApi = {
  id: number;
  name: string;
  names: NamedLanguage[];
  sprites: { default: string | null };
};

const INDEX_PATH = path.join(process.cwd(), "data", "item-search-index.json");

const globalForIndex = globalThis as unknown as {
  itemSearchIndex?: ItemSearchEntry[];
  itemSearchIndexPromise?: Promise<ItemSearchEntry[]>;
};

function fallbackSpriteUrl(name: string): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;
}

function findName(names: NamedLanguage[], language: string): string | null {
  return names.find((n) => n.language.name === language)?.name ?? null;
}

function extractId(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    console.error("API 호출 오류:", error);
    return null;
  }
}

function readCachedIndex(): ItemSearchEntry[] | null {
  try {
    if (!fs.existsSync(INDEX_PATH)) return null;
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as ItemSearchEntry[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedIndex(entries: ItemSearchEntry[]): void {
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(entries), "utf8");
}

async function buildIndex(): Promise<ItemSearchEntry[]> {
  const list = await fetchJson<ItemListApi>(
    "https://pokeapi.co/api/v2/item?limit=3000",
  );
  if (!list) return [];

  const ids = list.results
    .map((result) => extractId(result.url))
    .filter((id) => Number.isInteger(id) && id > 0)
    .sort((a, b) => a - b);

  const entries: ItemSearchEntry[] = [];
  const chunkSize = 40;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const itemList = await Promise.all(
      chunk.map((id) =>
        fetchJson<ItemApi>(`https://pokeapi.co/api/v2/item/${id}`),
      ),
    );

    for (let index = 0; index < chunk.length; index += 1) {
      const id = chunk[index];
      const item = itemList[index];
      const listName =
        list.results.find((r) => extractId(r.url) === id)?.name ?? null;
      entries.push({
        id,
        nameKo: item ? findName(item.names, "ko") : null,
        nameEn: item
          ? (findName(item.names, "en") ?? item.name)
          : listName,
        image: item?.sprites.default
          ? item.sprites.default
          : listName
            ? fallbackSpriteUrl(listName)
            : "",
      });
    }
  }

  writeCachedIndex(entries);
  return entries;
}

export async function getItemSearchIndex(): Promise<ItemSearchEntry[]> {
  if (globalForIndex.itemSearchIndex) {
    return globalForIndex.itemSearchIndex;
  }

  const cached = readCachedIndex();
  if (cached) {
    globalForIndex.itemSearchIndex = cached;
    return cached;
  }

  if (!globalForIndex.itemSearchIndexPromise) {
    globalForIndex.itemSearchIndexPromise = buildIndex().then((entries) => {
      globalForIndex.itemSearchIndex = entries;
      return entries;
    });
  }

  return globalForIndex.itemSearchIndexPromise;
}

export async function searchItems(
  query: string,
  limit = 12,
): Promise<ItemSearchEntry[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cappedLimit = Math.max(1, Math.min(limit, 30));
  const index = await getItemSearchIndex();

  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed);
    const exact = index.find((entry) => entry.id === id);
    if (exact) return [exact];
  }

  const needle = trimmed.toLowerCase();
  const matched = index.filter((entry) => {
    const ko = entry.nameKo?.toLowerCase() ?? "";
    const en = entry.nameEn?.toLowerCase() ?? "";
    return ko.includes(needle) || en.includes(needle);
  });

  return matched.slice(0, cappedLimit);
}

export async function getItemById(
  itemId: number,
): Promise<ItemSearchEntry | null> {
  if (!Number.isInteger(itemId) || itemId < 1) return null;
  const index = await getItemSearchIndex();
  return index.find((entry) => entry.id === itemId) ?? null;
}
