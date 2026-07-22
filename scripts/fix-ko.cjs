const fs = require("fs");

function write(path, content) {
  fs.writeFileSync(path, content, "utf8");
  new TextDecoder("utf-8", { fatal: true }).decode(fs.readFileSync(path));
  console.log("ok", path);
}

const every = "\uBAA8\uB4E0 \uD3EC\uCF13\uBAAC.";
const glance = "\uD55C\uB208\uC5D0.";
const browse = "\uC774\uB984\uACFC \uC774\uBBF8\uC9C0\uB97C \uB458\uB7EC\uBCF4\uACE0, \uC0C1\uC138 \uB3C4\uAC10\uC73C\uB85C \uC774\uC5B4\uC9D1\uB2C8\uB2E4.";
const openDex = "\uB3C4\uAC10 \uC5F4\uAE30";
const pika = "\uD53C\uCE74\uCD94 \uBCF4\uAE30";
const fullDex = "\uC804\uCCB4 \uB3C4\uAC10";
const failList = "\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
const more = "\uC790\uC138\uD788 \uBCF4\uAE30";
const prev = "\uC774\uC804";
const next = "\uB2E4\uC74C";
const openNav = "\uB3C4\uAC10 \uBCF4\uAE30";

write("app/poke/PokeNav.tsx", `import Link from "next/link";

export function PokeNav() {
  return (
    <div className="sticky top-0 z-50">
      <header
        className="bg-apple-black text-apple-on-dark"
        style={{ backgroundColor: "#000000" }}
      >
        <nav className="mx-auto flex h-11 max-w-[980px] items-center justify-between px-6 text-[12px] tracking-[-0.12px]">
          <Link href="/" className="opacity-90 active:scale-95">
            Home
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/poke" className="opacity-90 active:scale-95">
              Pokedex
            </Link>
            <Link href="/omok" className="opacity-90 active:scale-95">
              Omok
            </Link>
          </div>
        </nav>
      </header>
      <div
        className="border-b border-apple-hairline bg-apple-parchment"
        style={{ backgroundColor: "#f5f5f7" }}
      >
        <div className="mx-auto flex h-[52px] max-w-[980px] items-center justify-between px-6">
          <p className="text-[21px] font-semibold tracking-[0.231px] text-apple-ink">
            Pokedex
          </p>
          <Link
            href="/poke"
            className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[14px] text-white active:scale-95"
          >
            ${openNav}
          </Link>
        </div>
      </div>
    </div>
  );
}
`);

write("app/poke/page.tsx", `import Image from "next/image";
import Link from "next/link";
import { getPokemonList } from "@/lib/pokemon/getPokemonList";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PokeIndexPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const list = await getPokemonList(page, 40);

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center bg-apple-tile px-6 py-16 text-center text-apple-on-dark sm:py-20">
        <p className="mb-4 text-[21px] font-semibold tracking-[0.231px] text-apple-body-muted">
          Pokedex
        </p>
        <h1 className="max-w-[9ch] text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] sm:text-[56px] sm:leading-[1.07]">
          ${every}
          <br />
          ${glance}
        </h1>
        <p className="mt-6 max-w-md text-[21px] font-normal leading-[1.19] tracking-[0.231px] text-apple-body-muted sm:text-[28px] sm:leading-[1.14]">
          ${browse}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#pokedex-list"
            className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] tracking-[-0.374px] text-white active:scale-95"
          >
            ${openDex}
          </a>
          <Link
            href="/poke/25"
            className="rounded-full border border-apple-blue-on-dark px-[22px] py-[11px] text-[17px] tracking-[-0.374px] text-apple-blue-on-dark active:scale-95"
          >
            ${pika}
          </Link>
        </div>
        <div className="mt-16 flex justify-center gap-6 sm:gap-10">
          {[1, 4, 7, 25].map((id) => (
            <Image
              key={id}
              src={\`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\${id}.png\`}
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
            ${fullDex}
          </h2>
          <p className="mt-3 text-center text-[17px] leading-[1.47] tracking-[-0.374px] text-apple-muted-80">
            {list
              ? \`\uCD1D \${list.count.toLocaleString("ko-KR")}\uB9C8\uB9AC \u00B7 \${list.page} / \${list.totalPages} \uD398\uC774\uC9C0\`
              : "${failList}"}
          </p>

          {list ? (
            <>
              <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {list.items.map((pokemon) => {
                  const title =
                    pokemon.name.ko ?? pokemon.name.en ?? \`#\${pokemon.id}\`;
                  return (
                    <li key={pokemon.id}>
                      <Link
                        href={\`/poke/\${pokemon.id}\`}
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
                          #{\`\${pokemon.id}\`.padStart(4, "0")}
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
                          ${more}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-12 flex items-center justify-center gap-4">
                {list.page > 1 ? (
                  <Link
                    href={\`/poke?page=\${list.page - 1}#pokedex-list\`}
                    className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] text-white active:scale-95"
                  >
                    ${prev}
                  </Link>
                ) : null}
                {list.page < list.totalPages ? (
                  <Link
                    href={\`/poke?page=\${list.page + 1}#pokedex-list\`}
                    className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] text-white active:scale-95"
                  >
                    ${next}
                  </Link>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
`);
