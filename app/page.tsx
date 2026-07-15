import Image from "next/image";

export default function Home() {
  return (
    <div className="animated-gradient-bg relative flex flex-1 flex-col items-center justify-center overflow-hidden font-sans">
      <div
        className="floating-blob pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-400/40 blur-3xl"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="floating-blob pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-cyan-400/40 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="floating-blob pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-yellow-300/30 blur-3xl"
        style={{ animationDelay: "4s" }}
      />

      <main className="relative z-10 flex w-full max-w-3xl flex-1 flex-col items-center justify-between rounded-3xl border border-white/30 bg-white/20 px-16 py-32 shadow-2xl backdrop-blur-xl sm:items-start">
        <Image
          className="drop-shadow-lg brightness-0 invert"
          src="/next.svg"
          alt="Next.js 로고"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="gradient-text max-w-xs text-3xl font-bold leading-10 tracking-tight">
            시작하려면 page.tsx 파일을 수정하세요.
          </h1>
          <p className="max-w-md text-lg leading-8 text-white/90 drop-shadow-sm">
            시작점이나 더 자세한 안내가 필요하신가요?{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-semibold text-yellow-200 underline decoration-pink-300 underline-offset-4 transition-colors hover:text-pink-200"
            >
              템플릿
            </a>
            이나{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-semibold text-cyan-200 underline decoration-sky-300 underline-offset-4 transition-colors hover:text-sky-100"
            >
              학습
            </a>{" "}
            센터를 방문해 보세요.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row sm:flex-wrap">
          <a
            className="gradient-btn flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-white shadow-lg transition-transform hover:scale-105 md:w-[158px]"
            href="/omok"
          >
            게임하기
          </a>
          <a
            className="gradient-btn flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-white shadow-lg transition-transform hover:scale-105 md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="brightness-0 invert"
              src="/vercel.svg"
              alt="Vercel 로고"
              width={16}
              height={16}
            />
            지금 배포하기
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border-2 border-white/50 bg-white/20 px-5 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:border-white hover:bg-white/30 md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            문서
          </a>
        </div>
      </main>
    </div>
  );
}
