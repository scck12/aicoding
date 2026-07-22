import { NextResponse } from "next/server";
import { searchPokemonByName } from "@/lib/pokemon/searchIndex";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit")) || 12));

  if (!query.trim()) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchPokemonByName(query, limit);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("API 호출 오류:", error);
    return NextResponse.json(
      { error: "검색에 실패했습니다.", items: [] },
      { status: 500 },
    );
  }
}
