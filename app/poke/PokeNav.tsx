import Link from "next/link";

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
            <Link href="/poke/party" className="opacity-90 active:scale-95">
              Party
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
          <div className="flex items-center gap-2">
            <Link
              href="/poke/party"
              className="rounded-full border border-apple-blue px-[18px] py-[9px] text-[14px] text-apple-blue active:scale-95"
            >
              파티
            </Link>
            <Link
              href="/poke"
              className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[14px] text-white active:scale-95"
            >
              도감 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
