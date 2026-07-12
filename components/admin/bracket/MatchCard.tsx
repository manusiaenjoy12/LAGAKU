import { Shield, Trophy } from "lucide-react";
import { Pertandingan, formatMatchDate } from "@/utils";

interface MatchCardProps {
  match: Pertandingan;
}

export function MatchCard({ match }: MatchCardProps) {
  const finished = match.status === "selesai";
  const live = match.status === "berlangsung";
  const teamAWon = finished && match.pemenang_id === match.tim_a_id;
  const teamBWon = finished && match.pemenang_id === match.tim_b_id;

  const status = finished ? "FT" : live ? "LIVE" : "JADWAL";
  const date = match.tanggal_pertandingan
    ? formatMatchDate(match.tanggal_pertandingan)
    : "Waktu belum ditentukan";

  const teamRow = (
    name: string,
    score: number | null | undefined,
    winner: boolean,
  ) => (
    <div className={`flex items-center gap-2.5 px-3 py-2 ${winner ? "bg-emerald-50 dark:bg-emerald-950/30" : ""}`}>
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${winner ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
        {winner ? <Trophy className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
      </span>
      <span className={`min-w-0 flex-1 truncate text-sm ${winner ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
        {name}
      </span>
      <span className={`text-base tabular-nums ${winner ? "font-bold text-emerald-700 dark:text-emerald-300" : "font-semibold"}`}>
        {finished ? score ?? 0 : "–"}
      </span>
    </div>
  );

  return (
    <article className={`overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${live ? "border-red-400 ring-2 ring-red-100 dark:ring-red-950" : "border-border"}`}>
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5">
        <span className="truncate text-[11px] font-medium text-muted-foreground">{date}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${live ? "bg-red-500 text-white" : finished ? "bg-foreground text-background" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}>
          {status}
        </span>
      </div>
      <div className="divide-y">
        {teamRow(match.tim_a?.nama || "Ditentukan nanti", match.skor_tim_a, teamAWon)}
        {teamRow(match.tim_b?.nama || "Ditentukan nanti", match.skor_tim_b, teamBWon)}
      </div>
    </article>
  );
}
