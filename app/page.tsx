import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-apple-canvas font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-apple-ink">
      <header className="bg-apple-black text-apple-on-dark">
        <nav className="mx-auto flex h-11 max-w-[980px] items-center justify-between px-6 text-[12px] tracking-[-0.12px]">
          <span className="opacity-90">my-app</span>
          <div className="flex gap-5">
            <Link href="/poke" className="opacity-90 active:scale-95">
              Pokedex
            </Link>
            <Link href="/omok" className="opacity-90 active:scale-95">
              Omok
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center bg-apple-tile px-6 py-20 text-center text-apple-on-dark sm:py-28">
          <p className="mb-4 text-[21px] font-semibold tracking-[0.231px] text-apple-body-muted">
            Pokedex
          </p>
          <h1 className="max-w-[12ch] text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] sm:text-[56px] sm:leading-[1.07]">
            포켓몬을 갤러리처럼.
          </h1>
          <p className="mt-6 max-w-lg text-[21px] leading-[1.19] tracking-[0.231px] text-apple-body-muted sm:text-[28px] sm:leading-[1.14]">
            이름과 이미지를 둘러보고, 상세 정보까지 이어지는 도감입니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/poke"
              className="rounded-full bg-apple-blue px-7 py-3.5 text-[18px] font-light text-white active:scale-95"
            >
              도감 열기
            </Link>
            <Link
              href="/omok"
              className="rounded-full border border-apple-blue-on-dark px-7 py-3.5 text-[18px] font-light text-apple-blue-on-dark active:scale-95"
            >
              오목 하기
            </Link>
          </div>
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
            alt="Pikachu"
            width={320}
            height={320}
            priority
            className="mt-16 h-auto w-48 drop-shadow-[rgba(0,0,0,0.22)_3px_5px_30px] sm:w-72"
          />
        </section>

        <section className="bg-apple-parchment px-6 py-20 text-center">
          <h2 className="text-[34px] font-semibold tracking-[-0.374px] sm:text-[40px]">
            가변게 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[17px] leading-[1.47] tracking-[-0.374px] text-apple-muted-80">
            도감에서 포켓몬을 고르거나, 오목으로 한 판 즐겨 보세요.
          </p>
          <div className="mx-auto mt-10 grid max-w-[700px] gap-5 sm:grid-cols-2">
            <Link
              href="/poke"
              className="rounded-[18px] border border-apple-hairline bg-apple-canvas p-6 text-left active:scale-[0.98]"
            >
              <p className="text-[17px] font-semibold tracking-[-0.374px]">
                Pokedex
              </p>
              <p className="mt-2 text-[17px] leading-[1.47] tracking-[-0.374px] text-apple-muted-80">
                전체 목록과 상세 정보
              </p>
              <span className="mt-4 inline-block text-[17px] text-apple-blue">
                바로가기
              </span>
            </Link>
            <Link
              href="/omok"
              className="rounded-[18px] border border-apple-hairline bg-apple-canvas p-6 text-left active:scale-[0.98]"
            >
              <p className="text-[17px] font-semibold tracking-[-0.374px]">
                Omok
              </p>
              <p className="mt-2 text-[17px] leading-[1.47] tracking-[-0.374px] text-apple-muted-80">
                간단하고 빠른 한 판
              </p>
              <span className="mt-4 inline-block text-[17px] text-apple-blue">
                바로가기
              </span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
