import Image from "next/image";
import Link from "next/link";
import { getPokemonDetail } from "@/lib/pokemon/getPokemonDetail";
import { StatRadarChart } from "./StatRadarChart";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pokemon = await getPokemonDetail(id);

  if (!pokemon) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-apple-parchment px-6 py-20 text-center">
        <h1 className="text-[40px] font-semibold tracking-[-0.28px] text-apple-ink">
          포켓몬을 찾을 수 없습니다
        </h1>
        <Link
          href="/poke"
          className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] text-white active:scale-95"
        >
          도감으로 돌아가기
        </Link>
      </main>
    );
  }

  const displayName =
    pokemon.name.ko ?? pokemon.name.en ?? `포켓몬 ${pokemon.id}`;
  const prevId = pokemon.id > 1 ? pokemon.id - 1 : null;
  const nextId = pokemon.id + 1;

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center bg-apple-canvas px-6 py-16 text-center sm:py-20">
        <p className="text-[14px] tracking-[-0.224px] text-apple-muted-48">
          #{String(pokemon.id).padStart(4, "0")}
        </p>
        <h1 className="mt-3 text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] text-apple-ink sm:text-[56px] sm:leading-[1.07]">
          {pokemon.name.ko ?? "이름 없음"}
        </h1>
        {pokemon.name.en ? (
          <p className="mt-3 text-[28px] font-normal leading-[1.14] tracking-[0.196px] text-apple-muted-80">
            {pokemon.name.en}
          </p>
        ) : null}

        {pokemon.types.length > 0 ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {pokemon.types.map((type) => (
              <span
                key={`${type.ko}-${type.en}`}
                className="rounded-full border border-apple-hairline bg-apple-pearl px-4 py-2 text-[14px] tracking-[-0.224px] text-apple-muted-80"
              >
                {type.ko} · {type.en}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-14 flex flex-col items-center gap-12 sm:flex-row sm:items-center sm:gap-16">
          {pokemon.image.front ? (
            <figure className="flex flex-col items-center gap-3">
              <div className="flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
                <Image
                  src={pokemon.image.front}
                  alt={`${displayName} 앞면`}
                  width={176}
                  height={176}
                  priority
                  className="h-full w-full object-contain drop-shadow-[rgba(0,0,0,0.22)_3px_5px_30px]"
                />
              </div>
              <figcaption className="text-[14px] tracking-[-0.224px] text-apple-muted-48">
                앞면
              </figcaption>
            </figure>
          ) : null}
          {pokemon.image.back ? (
            <figure className="flex flex-col items-center gap-3">
              <div className="flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
                <Image
                  src={pokemon.image.back}
                  alt={`${displayName} 뒷면`}
                  width={176}
                  height={176}
                  priority
                  unoptimized={pokemon.image.back.endsWith(".gif")}
                  className="h-full w-full object-contain drop-shadow-[rgba(0,0,0,0.22)_3px_5px_30px]"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <figcaption className="text-[14px] tracking-[-0.224px] text-apple-muted-48">
                뒷면
              </figcaption>
            </figure>
          ) : null}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/poke#pokedex-list"
            className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] text-white active:scale-95"
          >
            도감 목록
          </Link>
          {prevId ? (
            <Link
              href={`/poke/${prevId}`}
              className="rounded-full border border-apple-blue px-[22px] py-[11px] text-[17px] text-apple-blue active:scale-95"
            >
              이전
            </Link>
          ) : null}
          <Link
            href={`/poke/${nextId}`}
            className="rounded-full border border-apple-blue px-[22px] py-[11px] text-[17px] text-apple-blue active:scale-95"
          >
            다음
          </Link>
        </div>
      </section>

      <section className="bg-apple-tile px-6 py-16 text-apple-on-dark sm:py-20">
        <div className="mx-auto grid max-w-[980px] gap-5 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/10 bg-apple-tile-2 p-6">
            <p className="text-[14px] tracking-[-0.224px] text-apple-body-muted">
              키
            </p>
            <p className="mt-2 text-[40px] font-semibold tracking-[-0.28px]">
              {pokemon.height}
              <span className="ml-2 text-[21px] font-normal text-apple-body-muted">
                m
              </span>
            </p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-apple-tile-2 p-6">
            <p className="text-[14px] tracking-[-0.224px] text-apple-body-muted">
              몸무게
            </p>
            <p className="mt-2 text-[40px] font-semibold tracking-[-0.28px]">
              {pokemon.weight}
              <span className="ml-2 text-[21px] font-normal text-apple-body-muted">
                kg
              </span>
            </p>
          </div>
        </div>

        {pokemon.cry ? (
          <div className="mx-auto mt-10 max-w-md text-center">
            <p className="mb-3 text-[14px] tracking-[-0.224px] text-apple-body-muted">
              울음소리
            </p>
            <audio controls src={pokemon.cry} className="w-full">
              울음소리를 재생할 수 없습니다.
            </audio>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col items-center bg-apple-parchment px-6 py-16 sm:py-20">
        <h2 className="text-[34px] font-semibold tracking-[-0.374px] text-apple-ink sm:text-[40px]">
          종족값
        </h2>
        <p className="mt-3 text-[17px] tracking-[-0.374px] text-apple-muted-80">
          여섯 가지 능력치를 한눈에
        </p>
        <div className="mt-10 w-full max-w-md">
          <StatRadarChart stats={pokemon.stats} />
        </div>
      </section>
    </main>
  );
}
