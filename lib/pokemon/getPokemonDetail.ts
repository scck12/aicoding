import { getStatLabel, getTypeLabel } from "./labels";
import type { PokemonDetail } from "./pokemonDetail";

type NamedLanguage = {
  name: string;
  language: { name: string };
};

type PokemonApi = {
  id: number;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  cries: { latest: string | null; legacy: string | null };
  sprites: {
    front_default: string | null;
    back_default: string | null;
    other?: {
      home?: { front_default: string | null };
      "official-artwork"?: { front_default: string | null };
      showdown?: { back_default: string | null };
    };
  };
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

export async function getPokemonDetail(
  id: string,
): Promise<PokemonDetail | null> {
  const [pokemon, species] = await Promise.all([
    fetchJson<PokemonApi>(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchJson<SpeciesApi>(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);

  if (!pokemon) return null;

  return {
    id: pokemon.id,
    name: {
      ko: species ? findName(species.names, "ko") : null,
      en: species ? findName(species.names, "en") : null,
    },
    image: {
      front:
        pokemon.sprites.other?.["official-artwork"]?.front_default ??
        pokemon.sprites.other?.home?.front_default ??
        pokemon.sprites.front_default ??
        null,
      back:
        pokemon.sprites.back_default ??
        pokemon.sprites.other?.showdown?.back_default ??
        null,
    },
    types: [...pokemon.types]
      .sort((a, b) => a.slot - b.slot)
      .map((slot) => getTypeLabel(slot.type.name)),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    cry: pokemon.cries.latest ?? null,
    stats: pokemon.stats.map((stat) => ({
      name: getStatLabel(stat.stat.name),
      baseStat: stat.base_stat,
    })),
  };
}
