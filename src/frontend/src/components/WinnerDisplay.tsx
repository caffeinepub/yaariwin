import { Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { RoundResult } from "../backend.d";
import { NumberTile } from "./NumberTile";

interface WinnerDisplayProps {
  result: RoundResult;
  roundName?: string;
}

export function WinnerDisplay({ result, roundName }: WinnerDisplayProps) {
  const winnerPrincipal = result.winnerId
    ? `${result.winnerId.toString().slice(0, 12)}...`
    : "No winner";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-gold/40 bg-card p-6 text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-transparent pointer-events-none" />

      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex justify-center mb-3"
      >
        <Trophy className="w-10 h-10 text-gold" />
      </motion.div>

      {roundName && (
        <p className="text-muted-foreground text-sm mb-1">{roundName}</p>
      )}
      <h2 className="text-2xl font-black text-gradient-gold mb-4">
        Result Declared!
      </h2>

      <div className="flex justify-center mb-4">
        <NumberTile
          number={Number(result.winningNumber)}
          size="lg"
          showAmount={false}
          isWinner
        />
      </div>

      <p className="text-muted-foreground text-sm mb-1">Winning Number</p>
      <p className="text-4xl font-black text-gold mb-4">
        {result.winningNumber.toString()}
      </p>

      {result.winnerId ? (
        <>
          <div className="bg-muted/50 rounded-xl p-4 mb-3">
            <p className="text-xs text-muted-foreground mb-1">Winner</p>
            <p className="font-mono text-sm text-foreground">
              {winnerPrincipal}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <div className="bg-muted/50 rounded-xl p-3 flex-1">
              <p className="text-xs text-muted-foreground">Bet Amount</p>
              <p className="text-lg font-black text-foreground">
                ₹{result.winnerBetAmount.toString()}
              </p>
            </div>
            <div className="bg-gold/20 border border-gold/40 rounded-xl p-3 flex-1">
              <p className="text-xs text-gold/80">Won</p>
              <p className="text-lg font-black text-gold">
                ₹{result.winnerPayout.toString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Star className="w-3 h-3" /> Lowest bet wins × 8 payout
          </p>
        </>
      ) : (
        <p className="text-muted-foreground">
          No bets were placed on the winning number.
        </p>
      )}
    </motion.div>
  );
}
