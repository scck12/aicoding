import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import {
  addPartyMemberItem,
  getPartySlotItems,
  removePartyMemberItem,
} from "@/lib/party";

type RouteContext = {
  params: Promise<{ id: string; slot: string }>;
};

async function parseIds(context: RouteContext) {
  const { id: idParam, slot: slotParam } = await context.params;
  const partyId = Number(idParam);
  const slot = Number(slotParam);
  if (!Number.isInteger(partyId) || partyId < 1) {
    return { error: "잘못된 파티 ID입니다." as const };
  }
  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    return { error: "슬롯은 1부터 6까지여야 합니다." as const };
  }
  return { partyId, slot };
}

function wantsJson(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  const contentType = request.headers.get("content-type") ?? "";
  return (
    contentType.includes("application/json") ||
    accept.includes("application/json")
  );
}

export async function GET(request: Request, context: RouteContext) {
  const parsed = await parseIds(context);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = getPartySlotItems(parsed.partyId, parsed.slot);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ items: result.items });
}

export async function POST(request: Request, context: RouteContext) {
  const parsed = await parseIds(context);
  if ("error" in parsed) {
    if (wantsJson(request)) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    return new NextResponse(parsed.error, { status: 400 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "잘못된 JSON입니다." }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const payload = body as { intent?: unknown; itemSlot?: unknown; itemId?: unknown };

    if (payload.intent === "remove") {
      const itemSlot = Number(payload.itemSlot);
      const result = removePartyMemberItem(
        parsed.partyId,
        parsed.slot,
        itemSlot,
      );
      if ("error" in result) {
        return NextResponse.json(
          { error: result.error },
          { status: result.status },
        );
      }
      return NextResponse.json({ party: result.party });
    }

    if (payload.itemId === undefined) {
      return NextResponse.json(
        { error: "itemId가 필요합니다." },
        { status: 400 },
      );
    }

    const itemId = Number(payload.itemId);
    const result = addPartyMemberItem(parsed.partyId, parsed.slot, itemId);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ party: result.party });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "add");

  if (intent === "remove") {
    const itemSlot = Number(formData.get("itemSlot"));
    const result = removePartyMemberItem(
      parsed.partyId,
      parsed.slot,
      itemSlot,
    );
    if ("error" in result) {
      return new NextResponse(result.error, { status: result.status });
    }
    redirect(`/poke/party/${parsed.partyId}`);
  }

  const itemId = Number(formData.get("itemId"));
  const result = addPartyMemberItem(parsed.partyId, parsed.slot, itemId);
  if ("error" in result) {
    return new NextResponse(result.error, { status: result.status });
  }
  redirect(`/poke/party/${parsed.partyId}`);
}
