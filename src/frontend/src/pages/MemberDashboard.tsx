import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Loader2, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_closed_open_declared } from "../backend.d";
import { NumberTile } from "../components/NumberTile";
import { WinnerDisplay } from "../components/WinnerDisplay";
import {
  useAllRounds,
  useCurrentRound,
  useMyBets,
  usePlaceBets,
  useRoundResult,
} from "../hooks/useQueries";

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type BetMap = Record<number, string>;

function RoundStatusBadge({ status }: { status: string }) {
  if (status === Variant_closed_open_declared.open)
    return (
      <Badge className="bg-green-700/30 text-green-400 border-green-700">
        🟢 Open
      </Badge>
    );
  if (status === Variant_closed_open_declared.closed)
    return (
      <Badge className="bg-yellow-700/30 text-yellow-400 border-yellow-700">
        🟡 Closed
      </Badge>
    );
  return (
    <Badge className="bg-gold/20 text-gold border-gold/40">🏆 Declared</Badge>
  );
}

function PastRoundItem({ roundId }: { roundId: bigint }) {
  const { data: result } = useRoundResult(roundId);
  if (!result) return null;
  return <WinnerDisplay result={result} />;
}

export function MemberDashboard() {
  const { data: currentRound, isLoading: roundLoading } = useCurrentRound();
  const { data: myBets, isLoading: betsLoading } = useMyBets(currentRound?.id);
  const { data: allRounds } = useAllRounds();
  const placeBets = usePlaceBets();

  const [betMap, setBetMap] = useState<BetMap>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleNumber = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) {
        next.delete(n);
        setBetMap((b) => {
          const nb = { ...b };
          delete nb[n];
          return nb;
        });
      } else {
        next.add(n);
      }
      return next;
    });
  };

  const handleAmountChange = (n: number, val: string) => {
    setBetMap((prev) => ({ ...prev, [n]: val }));
  };

  const handlePlaceBet = async () => {
    if (!currentRound) return;
    const bets = Array.from(selected)
      .filter((n) => betMap[n] && Number(betMap[n]) > 0)
      .map((n) => ({
        number: BigInt(n),
        amount: BigInt(Math.round(Number(betMap[n]))),
      }));
    if (bets.length === 0) {
      toast.error("Koi bhi number select karo aur amount daalo!");
      return;
    }
    try {
      await placeBets.mutateAsync({ roundId: currentRound.id, bets });
      toast.success("Bet place ho gayi! Qismat azmao! 🎉");
      setSelected(new Set());
      setBetMap({});
    } catch {
      toast.error("Bet place karne mein dikkat aayi. Dobara try karo.");
    }
  };

  const isOpen = currentRound?.status === Variant_closed_open_declared.open;
  const isDeclared =
    currentRound?.status === Variant_closed_open_declared.declared;
  const pastRounds = (allRounds ?? []).filter(
    (r) =>
      r.status === Variant_closed_open_declared.declared &&
      r.id !== currentRound?.id,
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Tabs defaultValue="play" className="w-full">
        <TabsList className="w-full mb-6 bg-card border border-border">
          <TabsTrigger data-ocid="member.tab" value="play" className="flex-1">
            🎯 Khelo
          </TabsTrigger>
          <TabsTrigger data-ocid="member.tab" value="mybets" className="flex-1">
            📋 Meri Bets
          </TabsTrigger>
          <TabsTrigger
            data-ocid="member.tab"
            value="results"
            className="flex-1"
          >
            🏆 Results
          </TabsTrigger>
        </TabsList>

        {/* PLAY TAB */}
        <TabsContent value="play">
          {roundLoading ? (
            <div data-ocid="member.loading_state" className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : !currentRound ? (
            <div data-ocid="member.empty_state" className="text-center py-16">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Abhi koi game nahi chal raha.
              </p>
              <p className="text-muted-foreground text-sm">
                Admin nayi round shuru karenge.
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4 bg-card border border-border rounded-xl p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Current Round</p>
                  <p className="font-bold text-foreground">
                    {currentRound.roundName}
                  </p>
                </div>
                <RoundStatusBadge status={currentRound.status} />
              </div>

              {isDeclared && currentRound.winningNumber !== undefined && (
                <div className="mb-6">
                  <PastRoundItem roundId={currentRound.id} />
                </div>
              )}

              {isOpen && (
                <>
                  <p className="text-sm font-bold text-gold mb-4">
                    Number chunoo — amount daalo:
                  </p>
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    {NUMBERS.map((n) => (
                      <NumberTile
                        key={n}
                        number={n}
                        selected={selected.has(n)}
                        amount={betMap[n] ?? ""}
                        onAmountChange={(val) => handleAmountChange(n, val)}
                        onClick={() => toggleNumber(n)}
                        showAmount
                      />
                    ))}
                  </div>
                  <Button
                    data-ocid="member.primary_button"
                    size="lg"
                    className="w-full bg-gold text-primary-foreground font-black text-lg rounded-xl hover:bg-gold-light"
                    onClick={handlePlaceBet}
                    disabled={placeBets.isPending || selected.size === 0}
                  >
                    {placeBets.isPending ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />{" "}
                        Placing...
                      </>
                    ) : (
                      "🎰 Bet Lagao!"
                    )}
                  </Button>
                  {placeBets.isSuccess && (
                    <p
                      data-ocid="member.success_state"
                      className="text-center text-green-400 text-sm mt-2"
                    >
                      ✅ Bet successfully placed!
                    </p>
                  )}
                </>
              )}

              {currentRound.status === Variant_closed_open_declared.closed && (
                <div className="text-center py-8 bg-card border border-border rounded-xl">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="font-bold">Betting Closed</p>
                  <p className="text-muted-foreground text-sm">
                    Abhi result ka wait karo...
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </TabsContent>

        {/* MY BETS TAB */}
        <TabsContent value="mybets">
          {betsLoading ? (
            <div data-ocid="member.loading_state">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !myBets || myBets.length === 0 ? (
            <div data-ocid="member.empty_state" className="text-center py-16">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Is round mein abhi koi bet nahi.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBets.map((bet, i) => (
                <motion.div
                  key={bet.roundId.toString()}
                  data-ocid={`member.item.${i + 1}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-muted-foreground">
                      Round #{bet.roundId.toString()}
                    </p>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {bet.numberBets.map((nb) => (
                      <div
                        key={nb.number.toString()}
                        className="flex items-center gap-2"
                      >
                        <NumberTile
                          number={Number(nb.number)}
                          size="sm"
                          showAmount={false}
                        />
                        <span className="text-sm font-bold text-gold">
                          ₹{nb.amount.toString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results">
          <AnimatePresence>
            {pastRounds.length === 0 ? (
              <div data-ocid="member.empty_state" className="text-center py-16">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Abhi koi results nahi hain.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastRounds.slice(0, 10).map((r, i) => (
                  <motion.div
                    key={r.id.toString()}
                    data-ocid={`member.item.${i + 1}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <PastRoundItem roundId={r.id} />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
