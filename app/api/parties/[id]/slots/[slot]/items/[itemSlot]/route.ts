import { NextResponse } from "next/server";
import { removePartyMemberItem } from "@/lib/party";

type RouteContext = {
  params: Promise<{ id: string; slot: string; itemSlot: string }>;
};

async function parseIds(context: RouteContext) {
  const {
    id: idParam,
    slot: slotParam,
    itemSlot: itemSlotParam,
  } = await context.params;
  const partyId = Number(idParam);
  const slot = Number(slotParam);
  const itemSlot = Number(itemSlotParam);
  if (!Number.isInteger(partyId) || partyId < 1) {
    return { error: "잘못된 파티 ID입니다." as const };
  }
  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    return { error: "슬롯은 1부터 6까지여야 합니다." as const };
  }
  if (!Number.isInteger(itemSlot) || itemSlot < 1 || itemSlot > 3) {
    return { error: "아이템 슬롯은 1부터 3까지여야 합니다." as const };
  }
  return { partyId, slot, itemSlot };
}

export async function DELETE(_request: Request, context: RouteContext) {
  const parsed = await parseIds(context);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = removePartyMemberItem(
    parsed.partyId,
    parsed.slot,
    parsed.itemSlot,
  );
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ party: result.party });
}
