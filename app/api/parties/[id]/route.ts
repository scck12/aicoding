import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import {
  deleteParty,
  getParty,
  updateParty,
  type PartyMemberInput,
} from "@/lib/party";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseMembers(value: unknown): PartyMemberInput[] | { error: string } {
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

export async function GET(_request: Request, context: RouteContext) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "잘못된 파티 ID입니다." }, { status: 400 });
  }

  const party = getParty(id);
  if (!party) {
    return NextResponse.json({ error: "파티를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ party });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "잘못된 파티 ID입니다." }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "이름 변경은 form POST 또는 PATCH를 사용해 주세요." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "");
  const result = updateParty(id, { name });
  if ("error" in result) {
    return new NextResponse(result.error, { status: result.status ?? 400 });
  }
  redirect(`/poke/party/${id}`);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "잘못된 파티 ID입니다." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 JSON입니다." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const input: { name?: string; members?: PartyMemberInput[] } = {};

  if ("name" in body) {
    const name = (body as { name: unknown }).name;
    if (typeof name !== "string") {
      return NextResponse.json(
        { error: "파티 이름 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }
    input.name = name;
  }

  if ("members" in body) {
    const membersResult = parseMembers((body as { members: unknown }).members);
    if ("error" in membersResult) {
      return NextResponse.json({ error: membersResult.error }, { status: 400 });
    }
    input.members = membersResult;
  }

  if (input.name === undefined && input.members === undefined) {
    return NextResponse.json(
      { error: "수정할 내용이 없습니다." },
      { status: 400 },
    );
  }

  const result = updateParty(id, input);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ party: result.party });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "잘못된 파티 ID입니다." }, { status: 400 });
  }

  const result = deleteParty(id);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true });
}
