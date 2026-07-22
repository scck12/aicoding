export type PokemonListItem = {
  id: number;
  name: {
    ko: string | null;
    en: string | null;
  };
  image: string | null;
};

export type PokemonListResult = {
  count: number;
  items: PokemonListItem[];
  page: number;
  pageSize: number;
  totalPages: number;
  type: string | null;
  typeLabel: { ko: string; en: string } | null;
};
