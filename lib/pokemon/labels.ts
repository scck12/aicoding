export const pokemonTypeKeys = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonTypeKey = (typeof pokemonTypeKeys)[number];

const typeLabelCache: Record<PokemonTypeKey, { ko: string; en: string }> = {
  normal: { ko: "\uB178\uB9D0", en: "Normal" },
  fire: { ko: "\uBD88\uAF43", en: "Fire" },
  water: { ko: "\uBB3C", en: "Water" },
  electric: { ko: "\uC804\uAE30", en: "Electric" },
  grass: { ko: "\uD480", en: "Grass" },
  ice: { ko: "\uC5BC\uC74C", en: "Ice" },
  fighting: { ko: "\uACA9\uD22C", en: "Fighting" },
  poison: { ko: "\uB3C5", en: "Poison" },
  ground: { ko: "\uB545", en: "Ground" },
  flying: { ko: "\uBE44\uD589", en: "Flying" },
  psychic: { ko: "\uC5D0\uC2A4\uD37C", en: "Psychic" },
  bug: { ko: "\uBC8C\uB808", en: "Bug" },
  rock: { ko: "\uBC14\uC704", en: "Rock" },
  ghost: { ko: "\uACE0\uC2A4\uD2B8", en: "Ghost" },
  dragon: { ko: "\uB4DC\uB798\uACE4", en: "Dragon" },
  dark: { ko: "\uC545", en: "Dark" },
  steel: { ko: "\uAC15\uCCA0", en: "Steel" },
  fairy: { ko: "\uD398\uC5B4\uB9AC", en: "Fairy" },
};

const statLabelCache: Record<string, string> = {
  hp: "HP",
  attack: "\uACF5\uACA9",
  defense: "\uBC29\uC5B4",
  "special-attack": "\uD2B9\uC218\uACF5\uACA9",
  "special-defense": "\uD2B9\uC218\uBC29\uC5B4",
  speed: "\uC2A4\uD53C\uB4DC",
};

export function isPokemonTypeKey(value: string): value is PokemonTypeKey {
  return (pokemonTypeKeys as readonly string[]).includes(value);
}

export function getTypeLabel(typeName: string): { ko: string; en: string } {
  if (isPokemonTypeKey(typeName)) {
    return typeLabelCache[typeName];
  }
  return {
    ko: typeName,
    en: typeName,
  };
}

export function getAllTypeLabels(): {
  key: PokemonTypeKey;
  ko: string;
  en: string;
}[] {
  return pokemonTypeKeys.map((key) => ({
    key,
    ...typeLabelCache[key],
  }));
}

export function getStatLabel(statName: string): string {
  return statLabelCache[statName] ?? statName;
}
