import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { listParties } from "@/lib/party";
import { CreatePartyForm } from "./CreatePartyForm";
import { DeletePartyButton } from "./DeletePartyButton";

const SLOT_COUNT = 6;

export default async function PartyListPage() {
  await connection();
  const parties = listParties();

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center bg-apple-tile px-6 py-16 text-center text-apple-on-dark sm:py-20">
        <p className="mb-4 text-[21px] font-semibold tracking-[0.231px] text-apple-body-muted">
          Party
        </p>
        <h1 className="max-w-[12ch] text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] sm:text-[56px] sm:leading-[1.07]">
          나만의 파티.
        </h1>
        <p className="mt-6 max-w-md text-[21px] font-normal leading-[1.19] tracking-[0.231px] text-apple-body-muted sm:text-[28px] sm:leading-[1.14]">
          좋아하는 포켓몬 6마리를 이름으로 묶어 저장하세요.
        </p>
        <CreatePartyForm />
      </section>

      <section className="bg-apple-parchment px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[34px] font-semibold tracking-[-0.374px] text-apple-ink sm:text-[40px]">
            저장된 파티
          </h2>
          <p className="mt-3 text-center text-[17px] tracking-[-0.374px] text-apple-muted-80">
            {parties.length > 0
              ? `${parties.length}개의 파티`
              : "아직 저장된 파티가 없습니다."}
          </p>

          {parties.length > 0 ? (
            <ul className="mt-12 space-y-5">
              {parties.map((party) => {
                const memberBySlot = new Map(
                  party.members.map((member) => [member.slot, member]),
                );
                return (
                  <li
                    key={party.id}
                    className="rounded-[18px] border border-apple-hairline bg-apple-canvas p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[12px] tracking-[-0.12px] text-apple-muted-48">
                          파티 #{party.id}
                        </p>
                        <h3 className="mt-1 text-[21px] font-semibold tracking-[0.231px] text-apple-ink">
                          {party.name}
                        </h3>
                        <p className="mt-1 text-[14px] tracking-[-0.224px] text-apple-muted-48">
                          {party.members.length} / 6마리
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/poke/party/${party.id}`}
                          className="rounded-full bg-apple-blue px-4 py-2 text-[14px] text-white active:scale-95"
                        >
                          편집
                        </Link>
                        <DeletePartyButton
                          partyId={party.id}
                          partyName={party.name}
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {Array.from({ length: SLOT_COUNT }, (_, index) => {
                        const slot = index + 1;
                        const member = memberBySlot.get(slot);
                        return (
                          <div
                            key={slot}
                            className="flex aspect-square flex-col items-center justify-center rounded-[14px] border border-apple-hairline bg-apple-pearl p-2"
                          >
                            {member ? (
                              <Image
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.pokemonId}.png`}
                                alt={`슬롯 ${slot}`}
                                width={96}
                                height={96}
                                className="h-auto w-full max-w-[72px] object-contain"
                              />
                            ) : (
                              <span className="text-[12px] text-apple-muted-48">
                                {slot}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </section>
    </main>
  );
}
