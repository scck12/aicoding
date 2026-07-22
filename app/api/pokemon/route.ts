import { NextResponse } from "next/server";
import { getPokemonList } from "@/lib/pokemon/getPokemonList";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    60,
    Math.max(1, Number(searchParams.get("pageSize")) || 40),
  );
  const type = searchParams.get("type");

  const list = await getPokemonList(page, pageSize, type);
  if (!list) {
    return NextResponse.json(
      { error: "포켓몬 목록을 불러오지 못했습니다." },
      { status: 502 },
    );
  }

  return NextResponse.json(list);
}
