import { NextResponse } from "next/server";
import { createParty, listParties, type PartyMemberInput } from "@/lib/party";

function parseMembers(value: unknown): PartyMemberInput[] | { error: string } {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    return { error: "members는 배열이어야 합니다." };
  }

  const members: PartyMemberInput[] = [];
  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("slot" in item) ||
      !("pokemonId" in item)
    ) {
      return { error: "members 항목 형식이 올바르지 않습니다." };
    }

    const slot = Number((item as { slot: unknown }).slot);
    const pokemonId = Number((item as { pokemonId: unknown }).pokemonId);
    members.push({ slot, pokemonId });
  }

  return members;
}

export async function GET() {
  const parties = listParties();
  return NextResponse.json({ parties });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 JSON입니다." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = "name" in body ? (body as { name: unknown }).name : undefined;
  if (typeof name !== "string") {
    return NextResponse.json(
      { error: "파티 이름이 필요합니다." },
      { status: 400 },
    );
  }

  const membersResult = parseMembers(
    "members" in body ? (body as { members: unknown }).members : undefined,
  );
  if ("error" in membersResult) {
    return NextResponse.json({ error: membersResult.error }, { status: 400 });
  }

  const result = createParty(name, membersResult);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ party: result.party }, { status: 201 });
}
