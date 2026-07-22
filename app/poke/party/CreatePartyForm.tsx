"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function CreatePartyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? `요청 실패: ${res.status}`);
      }
      const data = (await res.json()) as { party: { id: number } };
      setName("");
      router.push(`/poke/party/${data.party.id}`);
      router.refresh();
    } catch (err) {
      console.error("API 호출 오류:", err);
      setError(err instanceof Error ? err.message : "파티를 만들지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-md text-left">
      <label
        htmlFor="party-name"
        className="block text-[14px] tracking-[-0.224px] text-apple-muted-80"
      >
        새 파티 이름
      </label>
      <div className="mt-2 flex gap-3">
        <input
          id="party-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="예: 관동 스타터"
          className="min-w-0 flex-1 rounded-full border border-apple-hairline bg-apple-canvas px-5 py-3 text-[17px] tracking-[-0.374px] text-apple-ink outline-none focus:border-apple-blue"
          maxLength={40}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-apple-blue px-[22px] py-[11px] text-[17px] text-white active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? "저장 중" : "만들기"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-[14px] tracking-[-0.224px] text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}
