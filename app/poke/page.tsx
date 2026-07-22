import Image from "next/image";
import Link from "next/link";
import { getPokemonList } from "@/lib/pokemon/getPokemonList";
import { getAllTypeLabels } from "@/lib/pokemon/labels";

type PageProps = {
  searchParams: Promise<{ page?: string; type?: string }>;
};

function listHref(page: number, type?: string | null) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/poke?${query}#pokedex-list` : "/poke#pokedex-list";
}

export default async function PokeIndexPage({ searchParams }: PageProps) {
  const { page: pageParam, type: typeParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const selectedType = typeParam ?? null;
  const list = await getPokemonList(page, 40, selectedType);
  const typeOptions = getAllTypeLabels();

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center bg-apple-tile px-6 py-16 text-center text-apple-on-dark sm:py-20">
        <p className="mb-4 text-[21px] font-semibold tracking-[0.231px] text-apple-body-muted">
          Pokedex
        </p>
        <h1 className="max-w-[9ch] text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] sm:text-[56px] sm:leading-[1.07]">
          모든 포켓몬.
          <br />
          한눈에.
        </h1>
        <p className="mt-6 max-w-md text-[21px] font-normal leading-[1.19] tracking-[0.231px] text-apple-body-muted sm:text-[28px] sm:leading-[1.14]">
          이름과 이미지를 둘러보고, 상세 도감으로 이어집니다.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#pokedex-list"
            className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] tracking-[-0.374px] text-white active:scale-95"
          >
            도감 열기
          </a>
          <Link
            href="/poke/25"
            className="rounded-full border border-apple-blue-on-dark px-[22px] py-[11px] text-[17px] tracking-[-0.374px] text-apple-blue-on-dark active:scale-95"
          >
            피카추 보기
          </Link>
        </div>
        <div className="mt-16 flex justify-center gap-6 sm:gap-10">
          {[1, 4, 7, 25].map((id) => (
            <Image
              key={id}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
              alt=""
              width={180}
              height={180}
              priority={id === 25}
              className="h-auto w-20 drop-shadow-[rgba(0,0,0,0.22)_3px_5px_30px] sm:w-36"
            />
          ))}
        </div>
      </section>

      <section
        id="pokedex-list"
        className="bg-apple-parchment px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[34px] font-semibold leading-[1.47] tracking-[-0.374px] text-apple-ink sm:text-[40px] sm:leading-[1.1]">
            전체 도감
          </h2>
          <p className="mt-3 text-center text-[17px] leading-[1.47] tracking-[-0.374px] text-apple-muted-80">
            {list
              ? list.typeLabel
                ? `${list.typeLabel.ko} 타입 · 총 ${list.count.toLocaleString("ko-KR")}마리 · ${list.page} / ${list.totalPages} 페이지`
                : `총 ${list.count.toLocaleString("ko-KR")}마리 · ${list.page} / ${list.totalPages} 페이지`
              : "목록을 불러오지 못했습니다."}
          </p>

          <div className="mt-8">
            <p className="mb-3 text-center text-[14px] font-semibold tracking-[-0.224px] text-apple-muted-80">
              타입으로 찾기
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href={listHref(1, null)}
                className={
                  !selectedType
                    ? "rounded-full bg-apple-blue px-4 py-2 text-[14px] text-white"
                    : "rounded-full border border-apple-hairline bg-apple-canvas px-4 py-2 text-[14px] text-apple-blue active:scale-95"
                }
              >
                전체
              </Link>
              {typeOptions.map((typeOption) => {
                const isActive = selectedType === typeOption.key;
                return (
                  <Link
                    key={typeOption.key}
                    href={listHref(1, typeOption.key)}
                    className={
                      isActive
                        ? "rounded-full bg-apple-blue px-4 py-2 text-[14px] text-white"
                        : "rounded-full border border-apple-hairline bg-apple-canvas px-4 py-2 text-[14px] text-apple-blue active:scale-95"
                    }
                  >
                    {typeOption.ko}
                  </Link>
                );
              })}
            </div>
          </div>

          {list ? (
            <>
              <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {list.items.map((pokemon) => {
                  const title =
                    pokemon.name.ko ?? pokemon.name.en ?? `#${pokemon.id}`;
                  return (
                    <li key={pokemon.id}>
                      <Link
                        href={`/poke/${pokemon.id}`}
                        className="flex h-full flex-col rounded-[18px] border border-apple-hairline bg-apple-canvas p-6 active:scale-[0.98]"
                      >
                        <div className="flex aspect-square items-center justify-center">
                          {pokemon.image ? (
                            <Image
                              src={pokemon.image}
                              alt={title}
                              width={200}
                              height={200}
                              className="h-auto w-full max-w-[140px] drop-shadow-[rgba(0,0,0,0.22)_3px_5px_30px]"
                            />
                          ) : null}
                        </div>
                        <p className="mt-4 text-[12px] tracking-[-0.12px] text-apple-muted-48">
                          #{`${pokemon.id}`.padStart(4, "0")}
                        </p>
                        <p className="mt-1 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-apple-ink">
                          {title}
                        </p>
                        {pokemon.name.ko && pokemon.name.en ? (
                          <p className="mt-1 text-[14px] leading-[1.43] tracking-[-0.224px] text-apple-muted-48">
                            {pokemon.name.en}
                          </p>
                        ) : null}
                        <span className="mt-3 text-[17px] tracking-[-0.374px] text-apple-blue">
                          자세히 보기
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <nav
                aria-label="Pagination"
                className="mt-12 flex flex-wrap items-center justify-center gap-2"
              >
                {Array.from({ length: list.totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isCurrent = pageNumber === list.page;
                  return (
                    <Link
                      key={pageNumber}
                      href={listHref(pageNumber, list.type)}
                      aria-current={isCurrent ? "page" : undefined}
                      className={
                        isCurrent
                          ? "flex h-11 min-w-11 items-center justify-center rounded-full bg-apple-blue px-3 text-[17px] text-white"
                          : "flex h-11 min-w-11 items-center justify-center rounded-full border border-apple-hairline bg-apple-canvas px-3 text-[17px] text-apple-blue active:scale-95"
                      }
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
              </nav>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
