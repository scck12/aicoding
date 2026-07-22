import Link from "next/link";
import { connection } from "next/server";
import { getItemById } from "@/lib/items/searchIndex";
import { getPokemonDetail } from "@/lib/pokemon/getPokemonDetail";
import { getParty } from "@/lib/party";
import { PartySlots } from "./PartySlots";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PartyDetailPage({ params }: PageProps) {
  await connection();
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id < 1) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-apple-parchment px-6 py-20 text-center">
        <h1 className="text-[40px] font-semibold tracking-[-0.28px] text-apple-ink">
          잘못된 파티입니다
        </h1>
        <Link
          href="/poke/party"
          className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] text-white active:scale-95"
        >
          파티 목록
        </Link>
      </main>
    );
  }

  const party = getParty(id);
  if (!party) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-apple-parchment px-6 py-20 text-center">
        <h1 className="text-[40px] font-semibold tracking-[-0.28px] text-apple-ink">
          파티를 찾을 수 없습니다
        </h1>
        <Link
          href="/poke/party"
          className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] text-white active:scale-95"
        >
          파티 목록
        </Link>
      </main>
    );
  }

  const details = await Promise.all(
    party.members.map(async (member) => {
      const detail = await getPokemonDetail(String(member.pokemonId));
      return [member.pokemonId, detail] as const;
    }),
  );

  const labelById: Record<number, string> = {};
  for (const [pokemonId, detail] of details) {
    labelById[pokemonId] =
      detail?.name.ko ?? detail?.name.en ?? `#${pokemonId}`;
  }

  const itemIds = [
    ...new Set(
      party.members.flatMap((member) =>
        member.items.map((item) => item.itemId),
      ),
    ),
  ];
  const itemEntries = await Promise.all(
    itemIds.map(async (itemId) => [itemId, await getItemById(itemId)] as const),
  );
  const itemById = Object.fromEntries(itemEntries);

  const members = party.members.map((member) => ({
    slot: member.slot,
    pokemonId: member.pokemonId,
    label: labelById[member.pokemonId] ?? `#${member.pokemonId}`,
    items: member.items.map((item) => {
      const entry = itemById[item.itemId];
      return {
        itemSlot: item.itemSlot,
        itemId: item.itemId,
        label: entry?.nameKo ?? entry?.nameEn ?? `#${item.itemId}`,
        image: entry?.image ?? "",
      };
    }),
  }));

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-apple-canvas px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-[980px]">
          <p className="text-[14px] tracking-[-0.224px] text-apple-muted-48">
            파티 #{party.id}
          </p>
          <h1 className="mt-3 text-[40px] font-semibold tracking-[-0.28px] text-apple-ink sm:text-[56px]">
            {party.name}
          </h1>
          <p className="mt-4 max-w-lg text-[17px] tracking-[-0.374px] text-apple-muted-80">
            이름을 입력하는 즉시 아래에 사진과 이름이 나타납니다. 포켓몬마다
            아이템을 최대 3개까지 부여할 수 있습니다.
          </p>
          <Link
            href="/poke/party"
            className="mt-4 inline-block text-[17px] text-apple-blue active:scale-95"
          >
            파티 목록
          </Link>
        </div>
      </section>

      <section className="bg-apple-parchment px-6 py-16 sm:py-20">
        <PartySlots
          partyId={party.id}
          partyName={party.name}
          members={members}
        />
      </section>
    </main>
  );
}
