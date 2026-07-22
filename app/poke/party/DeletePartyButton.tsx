"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeletePartyButtonProps = {
  partyId: number;
  partyName: string;
};

export function DeletePartyButton({
  partyId,
  partyName,
}: DeletePartyButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`"${partyName}" 파티를 삭제할까요?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
      await res.json();
      router.refresh();
    } catch (error) {
      console.error("API 호출 오류:", error);
      window.alert("파티를 삭제하지 못했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-full border border-apple-hairline px-4 py-2 text-[14px] text-apple-muted-80 active:scale-95 disabled:opacity-60"
    >
      {isDeleting ? "삭제 중" : "삭제"}
    </button>
  );
}
