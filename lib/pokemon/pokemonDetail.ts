export type PokemonDetail = {
  id: number;
  name: {
    ko: string | null;
    en: string | null;
  };
  image: {
    front: string | null;
    back: string | null;
  };
  types: {
    ko: string;
    en: string;
  }[];
  height: number; // m
  weight: number; // kg
  cry: string | null; // cries.latest
  stats: {
    name: string; // 한글 라벨
    baseStat: number;
  }[];
};
