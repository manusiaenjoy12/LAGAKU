"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BracketRound } from "@/components/admin/bracket/BracketRound";
import { BracketRoundData, getRoundDisplayName } from "@/utils";

export function PublicKnockoutBracket({ eventId }: { eventId: string }) {
  const [rounds, setRounds] = useState<BracketRoundData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBracket = async () => {
      const supabase = createClient();
      setLoading(true);

      const [roundResult, matchResult, teamResult] = await Promise.all([
        supabase.from("round").select("*").eq("acara_id", eventId).order("urutan"),
        supabase.from("pertandingan").select("*").eq("acara_id", eventId),
        supabase.from("tim").select("id, nama, jurusan, status").eq("acara_id", eventId),
      ]);

      if (roundResult.error || matchResult.error || teamResult.error) {
        setRounds([]);
        setLoading(false);
        return;
      }

      const teams = teamResult.data || [];
      const bracketData = (roundResult.data || []).map((round) => ({
        round: {
          ...round,
          min_tim: round.min_tim ?? 2,
          max_tim: round.max_tim ?? 2,
        },
        matches: (matchResult.data || [])
          .filter((match) => match.round_id === round.id)
          .map((match) => ({
            ...match,
            tim_a: teams.find((team) => team.id === match.tim_a_id),
            tim_b: teams.find((team) => team.id === match.tim_b_id),
            round,
          }))
          .sort((a, b) => (a.posisi ?? 0) - (b.posisi ?? 0)),
      })) as BracketRoundData[];

      setRounds(bracketData);
      setLoading(false);
    };

    loadBracket();
  }, [eventId]);

  if (loading) {
    return <div className="h-72 animate-pulse rounded-2xl border bg-muted/40" />;
  }

  if (rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
        <Trophy className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
        <h3 className="font-semibold">Bagan belum tersedia</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bagan akan muncul setelah panitia membuat pertandingan.
        </p>
      </div>
    );
  }

  const maxMatches = Math.max(
    ...rounds.map((item) => item.matches.filter((match) => !match.is_bye).length),
    1,
  );

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-semibold">Babak Gugur</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Ikuti perjalanan setiap tim menuju pertandingan final.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b px-5 py-3 md:px-6">
        {rounds.map((item, index) => (
          <span
            key={item.round.id}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              index === rounds.length - 1
                ? "border border-foreground bg-muted text-foreground"
                : "bg-muted/70 text-muted-foreground"
            }`}
          >
            {getRoundDisplayName(item.round.nama, item.round.urutan, item.matches.length)}
          </span>
        ))}
      </div>

      <div className="flex gap-8 overflow-x-auto p-5 pb-8 md:p-6">
        {rounds.map((round, index) => (
          <BracketRound
            key={round.round.id}
            bracketRound={round}
            hasNextRound={index < rounds.length - 1}
            roundIndex={index}
            maxMatches={maxMatches}
          />
        ))}
      </div>
    </section>
  );
}
