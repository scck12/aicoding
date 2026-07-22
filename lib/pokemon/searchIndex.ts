import fs from "node:fs";
import path from "node:path";
import type { PokemonSearchEntry } from "./pokemonSearch";

export type { PokemonSearchEntry };

type NamedLanguage = {
  name: string;
  language: { name: string };
};

type SpeciesListApi = {
  count: number;
  results: { name: string; url: string }[];
};

type SpeciesApi = {
  id: number;
  names: NamedLanguage[];
};

const INDEX_PATH = path.join(process.cwd(), "data", "pokemon-search-index.json");

const globalForIndex = globalThis as unknown as {
  pokemonSearchIndex?: PokemonSearchEntry[];
  pokemonSearchIndexPromise?: Promise<PokemonSearchEntry[]>;
};

function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
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

function readCachedIndex(): PokemonSearchEntry[] | null {
  try {
    if (!fs.existsSync(INDEX_PATH)) return null;
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as PokemonSearchEntry[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedIndex(entries: PokemonSearchEntry[]): void {
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(entries), "utf8");
}

async function buildIndex(): Promise<PokemonSearchEntry[]> {
  const list = await fetchJson<SpeciesListApi>(
    "https://pokeapi.co/api/v2/pokemon-species?limit=2000",
  );
  if (!list) return [];

  const ids = list.results
    .map((result) => extractId(result.url))
    .filter((id) => Number.isInteger(id) && id > 0)
    .sort((a, b) => a - b);

  const entries: PokemonSearchEntry[] = [];
  const chunkSize = 40;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const speciesList = await Promise.all(
      chunk.map((id) =>
        fetchJson<SpeciesApi>(
          `https://pokeapi.co/api/v2/pokemon-species/${id}`,
        ),
      ),
    );

    for (let index = 0; index < chunk.length; index += 1) {
      const id = chunk[index];
      const species = speciesList[index];
      entries.push({
        id,
        nameKo: species ? findName(species.names, "ko") : null,
        nameEn: species
          ? findName(species.names, "en")
          : (list.results.find((r) => extractId(r.url) === id)?.name ?? null),
        image: artworkUrl(id),
      });
    }
  }

  writeCachedIndex(entries);
  return entries;
}

export async function getPokemonSearchIndex(): Promise<PokemonSearchEntry[]> {
  if (globalForIndex.pokemonSearchIndex) {
    return globalForIndex.pokemonSearchIndex;
  }

  const cached = readCachedIndex();
  if (cached) {
    globalForIndex.pokemonSearchIndex = cached;
    return cached;
  }

  if (!globalForIndex.pokemonSearchIndexPromise) {
    globalForIndex.pokemonSearchIndexPromise = buildIndex().then((entries) => {
      globalForIndex.pokemonSearchIndex = entries;
      return entries;
    });
  }

  return globalForIndex.pokemonSearchIndexPromise;
}

export async function searchPokemonByName(
  query: string,
  limit = 12,
): Promise<PokemonSearchEntry[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const needle = trimmed.toLowerCase();
  const index = await getPokemonSearchIndex();

  const matched = index.filter((entry) => {
    const ko = entry.nameKo?.toLowerCase() ?? "";
    const en = entry.nameEn?.toLowerCase() ?? "";
    return ko.includes(needle) || en.includes(needle);
  });

  return matched.slice(0, Math.max(1, Math.min(limit, 30)));
}
