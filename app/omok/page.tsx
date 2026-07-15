import Link from "next/link";
import OmokBoard from "@/components/OmokBoard";

export const metadata = {
  title: "오목 게임",
  description: "친구와 함께 즐기는 오목 게임",
};

export default function OmokPage() {
  return (
    <div className="animated-gradient-bg relative flex min-h-full flex-1 flex-col items-center overflow-hidden px-4 py-10 font-sans sm:py-14">
      <div
        className="floating-blob pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-400/40 blur-3xl"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="floating-blob pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-cyan-400/40 blur-3xl"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 mb-8 flex w-full max-w-xl flex-col items-center gap-4">
        <Link
          href="/"
          className="self-start rounded-full border border-white/40 bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
        >
          ← 홈으로
        </Link>
        <h1 className="gradient-text text-4xl font-bold tracking-tight">
          오목
        </h1>
        <p className="text-center text-white/90">
          흑돌부터 시작합니다. 다섯 목을 완성해 보세요!
        </p>
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/30 bg-white/15 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
        <OmokBoard />
      </div>
    </div>
  );
}
