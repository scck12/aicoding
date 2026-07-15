"use client";

import { useState } from "react";
import {
  BOARD_SIZE,
  checkWinner,
  createEmptyBoard,
  getOpponent,
  isBoardFull,
  type Player,
  type Stone,
} from "@/lib/omok";

export default function OmokBoard() {
  const [board, setBoard] = useState<Stone[][]>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("black");
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(
    null,
  );

  function handleCellClick(row: number, col: number) {
    if (winner || isDraw || board[row][col] !== null) {
      return;
    }

    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = currentPlayer;
    setBoard(nextBoard);
    setLastMove({ row, col });

    if (checkWinner(nextBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
      return;
    }

    if (isBoardFull(nextBoard)) {
      setIsDraw(true);
      return;
    }

    setCurrentPlayer(getOpponent(currentPlayer));
  }

  function handleReset() {
    setBoard(createEmptyBoard());
    setCurrentPlayer("black");
    setWinner(null);
    setIsDraw(false);
    setLastMove(null);
  }

  const statusMessage = winner
    ? `${winner === "black" ? "흑돌" : "백돌"} 승리!`
    : isDraw
      ? "무승부입니다!"
      : `${currentPlayer === "black" ? "흑돌" : "백돌"} 차례입니다`;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xl font-bold text-white drop-shadow-md">
          {statusMessage}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
            <span
              className={`h-4 w-4 rounded-full border border-black/20 shadow ${
                currentPlayer === "black" && !winner && !isDraw
                  ? "ring-2 ring-yellow-300 ring-offset-2 ring-offset-transparent"
                  : ""
              } bg-zinc-900`}
            />
            <span className="text-sm font-medium text-white">흑</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
            <span
              className={`h-4 w-4 rounded-full border border-black/10 shadow ${
                currentPlayer === "white" && !winner && !isDraw
                  ? "ring-2 ring-yellow-300 ring-offset-2 ring-offset-transparent"
                  : ""
              } bg-white`}
            />
            <span className="text-sm font-medium text-white">백</span>
          </div>
        </div>
      </div>

      <div
        className="w-full max-w-[min(100%,520px)] rounded-2xl border-4 border-amber-800/80 bg-[#deb887] p-2 shadow-2xl sm:p-3"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #e8c992 0%, #d4a574 50%, #c4956a 100%)",
        }}
      >
        <div
          className="relative aspect-square w-full"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isLast =
                lastMove?.row === rowIndex && lastMove?.col === colIndex;

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  aria-label={`${rowIndex + 1}행 ${colIndex + 1}열`}
                  disabled={!!winner || isDraw || cell !== null}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className="relative flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                >
                  <span
                    className="pointer-events-none absolute inset-0"
                    aria-hidden
                  >
                    {colIndex < BOARD_SIZE - 1 && (
                      <span className="absolute top-1/2 right-0 left-1/2 h-px bg-amber-950/50" />
                    )}
                    {colIndex > 0 && (
                      <span className="absolute top-1/2 right-1/2 left-0 h-px bg-amber-950/50" />
                    )}
                    {rowIndex < BOARD_SIZE - 1 && (
                      <span className="absolute top-1/2 right-1/2 bottom-0 w-px bg-amber-950/50" />
                    )}
                    {rowIndex > 0 && (
                      <span className="absolute top-0 right-1/2 bottom-1/2 w-px bg-amber-950/50" />
                    )}
                  </span>

                  {cell && (
                    <span
                      className={`relative z-10 h-[70%] w-[70%] rounded-full shadow-md ${
                        cell === "black"
                          ? "bg-gradient-to-br from-zinc-700 to-zinc-950"
                          : "bg-gradient-to-br from-white to-zinc-200"
                      } ${isLast ? "ring-2 ring-red-500 ring-offset-1 ring-offset-[#d4a574]" : ""}`}
                    />
                  )}

                  {!cell && !winner && !isDraw && (
                    <span className="relative z-10 h-[50%] w-[50%] rounded-full opacity-0 transition-opacity hover:bg-black/15 hover:opacity-100" />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {(winner || isDraw) && (
        <div className="rounded-2xl border border-white/40 bg-white/25 px-6 py-4 text-center backdrop-blur-md">
          <p className="mb-3 text-lg font-bold text-white">{statusMessage}</p>
          <button
            type="button"
            onClick={handleReset}
            className="gradient-btn rounded-full px-6 py-2.5 font-semibold text-white shadow-lg transition-transform hover:scale-105"
          >
            다시 하기
          </button>
        </div>
      )}

      {!winner && !isDraw && (
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full border-2 border-white/50 bg-white/20 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/30"
        >
          판 초기화
        </button>
      )}

      <p className="text-center text-sm text-white/80">
        두 명이 번갈아 두며, 가로·세로·대각선으로 다섯 개를 먼저 놓으면
        승리합니다.
      </p>
    </div>
  );
}
