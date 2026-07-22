import type { Metadata } from "next";
import { PokeNav } from "./PokeNav";

export const metadata: Metadata = {
  title: "Pokedex",
  description: "Pokemon Pokedex",
};

export default function PokeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-apple-canvas font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-apple-ink antialiased">
      <PokeNav />
      {children}
      <footer className="bg-apple-parchment px-6 py-16 text-center text-[12px] tracking-[-0.12px] text-apple-muted-48">
        Data from PokeAPI
      </footer>
    </div>
  );
}
