import {
  getTypeLabel,
  isPokemonTypeKey,
  type PokemonTypeKey,
} from "./labels";
import type { PokemonListItem, PokemonListResult } from "./pokemonList";

type NamedLanguage = {
  name: string;
  language: { name: string };
};

type PokemonListApi = {
  count: number;
  results: { name: string; url: string }[];
};

type TypeApi = {
  pokemon: {
    pokemon: { name: string; url: string };
    slot: number;
  }[];
};

type SpeciesApi = {
  names: NamedLanguage[];
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API 호출 오류:", error);
    return null;
  }
}

function findName(names: NamedLanguage[], language: string): string | null {
  return names.find((n) => n.language.name === language)?.name ?? null;
}

function extractId(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

async function buildListItems(
  entries: { name: string; url: string }[],
): Promise<PokemonListItem[]> {
  return Promise.all(
    entries.map(async (result) => {
      const id = extractId(result.url);
      const species = await fetchJson<SpeciesApi>(
        `https://pokeapi.co/api/v2/pokemon-species/${id}`,
      );

      return {
        id,
        name: {
          ko: species ? findName(species.names, "ko") : null,
          en: species ? findName(species.names, "en") : result.name,
        },
        image: artworkUrl(id),
      };
    }),
  );
}

export async function getPokemonList(
  page = 1,
  pageSize = 40,
  type?: string | null,
): Promise<PokemonListResult | null> {
  const safePage = Math.max(1, page);
  const selectedType: PokemonTypeKey | null =
    type && isPokemonTypeKey(type) ? type : null;

  if (selectedType) {
    const typeData = await fetchJson<TypeApi>(
      `https://pokeapi.co/api/v2/type/${selectedType}`,
    );
    if (!typeData) return null;

    const allEntries = typeData.pokemon
      .map((entry) => entry.pokemon)
      .sort((a, b) => extractId(a.url) - extractId(b.url));

    const count = allEntries.length;
    const totalPages = Math.max(1, Math.ceil(count / pageSize));
    const clampedPage = Math.min(safePage, totalPages);
    const offset = (clampedPage - 1) * pageSize;
    const pageEntries = allEntries.slice(offset, offset + pageSize);
    const items = await buildListItems(pageEntries);

    return {
      count,
      items,
      page: clampedPage,
      pageSize,
      totalPages,
      type: selectedType,
      typeLabel: getTypeLabel(selectedType),
    };
  }

  const offset = (safePage - 1) * pageSize;
  const list = await fetchJson<PokemonListApi>(
    `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`,
  );

  if (!list) return null;

  const items = await buildListItems(list.results);
  const totalPages = Math.max(1, Math.ceil(list.count / pageSize));

  return {
    count: list.count,
    items,
    page: safePage,
    pageSize,
    totalPages,
    type: null,
    typeLabel: null,
  };
}
