"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LiveMatch {
  id: string;
  skor_tim_a: number | null;
  skor_tim_b: number | null;
  kategori_lomba: string | null;
  tim_a: { nama: string } | null;
  tim_b: { nama: string } | null;
  acara: { id: string; nama: string } | null;
}

export function LiveScoreSection() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase
        .from("pertandingan")
        .select("id, skor_tim_a, skor_tim_b, kategori_lomba, tim_a:tim_a_id(nama), tim_b:tim_b_id(nama), acara:acara_id(id,nama)")
        .eq("status", "berlangsung")
        .limit(4);
      setMatches((data || []) as unknown as LiveMatch[]);
    };
    load();
    const channel = supabase.channel("homepage-live-score")
      .on("postgres_changes", { event: "*", schema: "public", table: "pertandingan" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (matches.length === 0) return null;

  return (
    <section className="border-b bg-red-50/80 dark:bg-red-950/20">
      <div className="container mx-auto px-4 py-5">
        <div className="mb-3 flex items-center gap-2"><Radio className="h-5 w-5 animate-pulse text-red-600" /><h2 className="font-bold">Live Score</h2><Badge variant="destructive">LIVE</Badge></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {matches.map((match) => (
            <Link key={match.id} href={match.acara ? `/tournaments/${match.acara.id}` : "/match"}>
              <Card className="h-full border-red-200 transition hover:-translate-y-0.5 hover:shadow-md dark:border-red-900">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="truncate">{match.acara?.nama}</span><span>{match.kategori_lomba || "Umum"}</span></div>
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold"><span className="truncate">{match.tim_a?.nama || "Tim A"}</span><span className="text-xl tabular-nums">{match.skor_tim_a ?? 0}</span></div>
                    <div className="flex justify-between font-semibold"><span className="truncate">{match.tim_b?.nama || "Tim B"}</span><span className="text-xl tabular-nums">{match.skor_tim_b ?? 0}</span></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
