import Image from "next/image";
import Link from "next/link";

type SlotItem = {
  itemSlot: number;
  itemId: number;
  label: string;
  image: string;
};

type SlotMember = {
  slot: number;
  pokemonId: number;
  label: string;
  items: SlotItem[];
};

type PartySlotsProps = {
  partyId: number;
  partyName: string;
  members: SlotMember[];
};

const SLOT_COUNT = 6;
const MAX_ITEMS = 3;

export function PartySlots({ partyId, partyName, members }: PartySlotsProps) {
  const memberBySlot = new Map(members.map((member) => [member.slot, member]));

  return (
    <div className="mx-auto w-full max-w-[980px]">
      <form
        action={`/api/parties/${partyId}`}
        method="post"
        className="max-w-md"
      >
        <label
          htmlFor="edit-party-name"
          className="block text-[14px] tracking-[-0.224px] text-apple-muted-80"
        >
          파티 이름
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="edit-party-name"
            name="name"
            defaultValue={partyName}
            maxLength={40}
            className="min-w-0 flex-1 rounded-full border border-apple-hairline bg-apple-canvas px-5 py-3 text-[17px] tracking-[-0.374px] text-apple-ink outline-none focus:border-apple-blue"
            required
          />
          <button
            type="submit"
            className="rounded-full border border-apple-blue px-4 py-2 text-[14px] text-apple-blue active:scale-95"
          >
            이름 저장
          </button>
        </div>
      </form>

      <div className="mt-10 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SLOT_COUNT }, (_, index) => {
          const slot = index + 1;
          const member = memberBySlot.get(slot);
          const canAddItem = member && member.items.length < MAX_ITEMS;

          return (
            <div
              key={slot}
              className="rounded-[18px] border border-apple-hairline bg-apple-canvas p-5"
            >
              <p className="text-[14px] tracking-[-0.224px] text-apple-muted-48">
                슬롯 {slot}
              </p>

              <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-[14px] bg-apple-pearl">
                {member ? (
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.pokemonId}.png`}
                    alt={member.label}
                    width={120}
                    height={120}
                    className="h-auto w-28 object-contain"
                  />
                ) : (
                  <span className="text-[14px] text-apple-muted-48">비어 있음</span>
                )}
              </div>

              <p className="mt-3 text-[17px] font-semibold tracking-[-0.374px] text-apple-ink">
                {member?.label ?? "포켓몬을 검색해 주세요"}
              </p>

              <div className="mt-4">
                <label
                  className="mb-2 block text-[12px] tracking-[-0.12px] text-apple-muted-48"
                  htmlFor={`party-search-${slot}`}
                >
                  이름 검색
                </label>
                <input
                  id={`party-search-${slot}`}
                  type="search"
                  name={`q-slot-${slot}`}
                  data-party-search="1"
                  data-slot={String(slot)}
                  data-party-id={String(partyId)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="e.g. pikachu / ko name"
                  className="w-full rounded-full border border-apple-hairline bg-white px-4 py-2.5 text-[14px] tracking-[-0.224px] text-apple-ink outline-none focus:border-apple-blue"
                />
                <div
                  id={`party-search-results-${slot}`}
                  hidden
                  className="mt-2 max-h-80 overflow-y-auto rounded-[14px] border-2 border-[#2997ff]/40 bg-white"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={`/poke/party/${partyId}/pick/${slot}`}
                  className="text-[14px] text-apple-blue active:scale-95"
                >
                  도감에서 고르기
                </Link>
                {member ? (
                  <form
                    action={`/api/parties/${partyId}/slots/${slot}`}
                    method="post"
                  >
                    <input type="hidden" name="intent" value="clear" />
                    <button
                      type="submit"
                      className="text-[14px] text-apple-muted-80 active:scale-95"
                    >
                      비우기
                    </button>
                  </form>
                ) : null}
              </div>

              {member ? (
                <div className="mt-5 border-t border-apple-hairline pt-4">
                  <p className="text-[12px] tracking-[-0.12px] text-apple-muted-48">
                    아이템 ({member.items.length}/{MAX_ITEMS})
                  </p>

                  {member.items.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {member.items.map((item) => (
                        <li
                          key={item.itemSlot}
                          className="flex items-center gap-2 rounded-[12px] bg-apple-pearl px-3 py-2"
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.label}
                              width={28}
                              height={28}
                              className="h-7 w-7 object-contain"
                            />
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center text-[10px] text-apple-muted-48">
                              —
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate text-[14px] tracking-[-0.224px] text-apple-ink">
                            {item.label}
                          </span>
                          <form
                            action={`/api/parties/${partyId}/slots/${slot}/items`}
                            method="post"
                          >
                            <input type="hidden" name="intent" value="remove" />
                            <input
                              type="hidden"
                              name="itemSlot"
                              value={item.itemSlot}
                            />
                            <button
                              type="submit"
                              className="text-[12px] text-apple-muted-80 active:scale-95"
                            >
                              삭제
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[13px] text-apple-muted-48">
                      부여된 아이템이 없습니다
                    </p>
                  )}

                  {canAddItem ? (
                    <div className="mt-3">
                      <label
                        className="mb-2 block text-[12px] tracking-[-0.12px] text-apple-muted-48"
                        htmlFor={`party-item-search-${slot}`}
                      >
                        아이템 검색 (이름 / 번호)
                      </label>
                      <input
                        id={`party-item-search-${slot}`}
                        type="search"
                        name={`q-item-slot-${slot}`}
                        data-party-item-search="1"
                        data-slot={String(slot)}
                        data-party-id={String(partyId)}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="e.g. 마스터볼 / 1"
                        className="w-full rounded-full border border-apple-hairline bg-white px-4 py-2.5 text-[14px] tracking-[-0.224px] text-apple-ink outline-none focus:border-apple-blue"
                      />
                      <div
                        id={`party-item-search-results-${slot}`}
                        hidden
                        className="mt-2 max-h-80 overflow-y-auto rounded-[14px] border-2 border-[#2997ff]/40 bg-white"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
