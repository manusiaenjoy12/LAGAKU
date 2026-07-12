import { Trophy } from "lucide-react";
import { MatchCard } from "./MatchCard";
import { BracketRoundData, getRoundDisplayName, isFinalRound } from "@/utils";

interface BracketRoundProps {
  bracketRound: BracketRoundData;
  hasNextRound?: boolean;
  roundIndex: number;
  maxMatches: number;
}

export function BracketRound({
  bracketRound,
  hasNextRound = false,
  roundIndex,
  maxMatches,
}: BracketRoundProps) {
  const { round, matches, isPlaceholder = false } = bracketRound;
  const displayName = getRoundDisplayName(round.nama, round.urutan, matches.length);
  const visibleMatches = matches.filter((match) => !match.is_bye);
  const byeMatches = matches.filter((match) => match.is_bye);
  const isFinal = isFinalRound(visibleMatches);
  const slotHeight = 142 * 2 ** roundIndex;
  const boardHeight = Math.max(300, maxMatches * 142);

  return (
    <section className={`w-[280px] shrink-0 ${isPlaceholder ? "opacity-70" : ""}`}>
      <header className="sticky top-0 z-20 mb-4 border-b bg-background/95 pb-3 text-center backdrop-blur">
        <div className="flex items-center justify-center gap-2">
          {isFinal && <Trophy className="h-4 w-4 text-amber-500" />}
          <h3 className="font-semibold text-foreground">{displayName}</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {visibleMatches.length} pertandingan
        </p>
      </header>

      <div className="relative" style={{ height: boardHeight }}>
        {visibleMatches.map((match, index) => {
          const top = index * slotHeight + slotHeight / 2 - 55;
          const pairOffset = slotHeight / 2;
          const isUpper = index % 2 === 0;

          return (
            <div
              key={match.id}
              className="absolute left-0 w-full"
              style={{ top }}
            >
              <MatchCard match={match} />

              {hasNextRound && (
                <div className="pointer-events-none absolute left-full top-1/2 hidden w-8 md:block">
                  <span className="absolute left-0 top-0 h-px w-4 bg-border" />
                  <span
                    className="absolute left-4 w-px bg-border"
                    style={{
                      top: isUpper ? 0 : -pairOffset,
                      height: pairOffset,
                    }}
                  />
                  <span
                    className="absolute left-4 h-px w-4 bg-border"
                    style={{ top: isUpper ? pairOffset : -pairOffset }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {visibleMatches.length === 0 && (
          <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
            Menunggu pertandingan
          </div>
        )}
      </div>

      {byeMatches.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Lolos otomatis (BYE)</p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
            {byeMatches.map((match) => match.tim_a?.nama || "TBD").join(", ")}
          </p>
        </div>
      )}
    </section>
  );
}
