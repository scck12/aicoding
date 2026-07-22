import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getPokemonList } from "@/lib/pokemon/getPokemonList";
import { getAllTypeLabels } from "@/lib/pokemon/labels";
import { getParty } from "@/lib/party";

type PageProps = {
  params: Promise<{ id: string; slot: string }>;
  searchParams: Promise<{ page?: string; type?: string }>;
};

function pickHref(
  partyId: number,
  slot: number,
  page: number,
  type?: string | null,
) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  const base = `/poke/party/${partyId}/pick/${slot}`;
  return query ? `${base}?${query}` : base;
}

export default async function PickPokemonPage({
  params,
  searchParams,
}: PageProps) {
  await connection();
  const { id: idParam, slot: slotParam } = await params;
  const { page: pageParam, type: typeParam } = await searchParams;

  const partyId = Number(idParam);
  const slot = Number(slotParam);
  const page = Math.max(1, Number(pageParam) || 1);
  const selectedType = typeParam ?? null;

  if (!Number.isInteger(partyId) || partyId < 1) {
    redirect("/poke/party");
  }
  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    redirect(`/poke/party/${partyId}`);
  }

  const party = getParty(partyId);
  if (!party) {
    redirect("/poke/party");
  }

  const list = await getPokemonList(page, 40, selectedType);
  const typeOptions = getAllTypeLabels();

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-apple-canvas px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-[980px]">
          <p className="text-[14px] tracking-[-0.224px] text-apple-muted-48">
            {party.name} · 슬롯 {slot}
          </p>
          <h1 className="mt-3 text-[40px] font-semibold tracking-[-0.28px] text-apple-ink sm:text-[56px]">
            포켓몬 고르기
          </h1>
          <p className="mt-4 text-[17px] tracking-[-0.374px] text-apple-muted-80">
            사진과 이름을 보고 선택하면 API로 파티에 저장됩니다.
          </p>
          <Link
            href={`/poke/party/${partyId}`}
            className="mt-4 inline-block text-[17px] text-apple-blue active:scale-95"
          >
            파티로 돌아가기
          </Link>
        </div>
      </section>

      <section className="bg-apple-parchment px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-[980px]">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href={pickHref(partyId, slot, 1, null)}
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
                  href={pickHref(partyId, slot, 1, typeOption.key)}
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

          {!list ? (
            <p className="mt-12 text-center text-[17px] text-apple-muted-80">
              목록을 불러오지 못했습니다.
            </p>
          ) : (
            <>
              <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {list.items.map((pokemon) => {
                  const title =
                    pokemon.name.ko ?? pokemon.name.en ?? `#${pokemon.id}`;
                  return (
                    <li key={pokemon.id}>
                      <form
                        action={`/api/parties/${partyId}/slots/${slot}`}
                        method="post"
                        className="h-full"
                      >
                        <input
                          type="hidden"
                          name="pokemonId"
                          value={pokemon.id}
                        />
                        <button
                          type="submit"
                          className="flex h-full w-full flex-col rounded-[18px] border border-apple-hairline bg-apple-canvas p-4 text-left active:scale-[0.98]"
                        >
                          <div className="flex aspect-square items-center justify-center">
                            {pokemon.image ? (
                              <Image
                                src={pokemon.image}
                                alt={title}
                                width={160}
                                height={160}
                                className="h-auto w-full max-w-[120px] object-contain"
                              />
                            ) : null}
                          </div>
                          <p className="mt-3 text-[12px] tracking-[-0.12px] text-apple-muted-48">
                            #{String(pokemon.id).padStart(4, "0")}
                          </p>
                          <p className="mt-1 text-[17px] font-semibold tracking-[-0.374px] text-apple-ink">
                            {title}
                          </p>
                          <span className="mt-2 text-[14px] text-apple-blue">
                            이 포켓몬 넣기
                          </span>
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>

              <nav
                aria-label="Pagination"
                className="mt-12 flex flex-wrap items-center justify-center gap-2"
              >
                {Array.from(
                  { length: Math.min(list.totalPages, 20) },
                  (_, index) => {
                    const pageNumber = index + 1;
                    const isCurrent = pageNumber === list.page;
                    return (
                      <Link
                        key={pageNumber}
                        href={pickHref(partyId, slot, pageNumber, list.type)}
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
                  },
                )}
              </nav>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
