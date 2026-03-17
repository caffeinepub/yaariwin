import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Loader2, Lock, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_closed_open_declared } from "../backend.d";
import { NumberTile } from "../components/NumberTile";
import { WinnerDisplay } from "../components/WinnerDisplay";
import {
  useAllBetsForRound,
  useAllRounds,
  useCloseRound,
  useCreateRound,
  useCurrentRound,
  useDeclareWinner,
  useRoundResult,
} from "../hooks/useQueries";

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function AdminDashboard() {
  const { data: currentRound, isLoading: roundLoading } = useCurrentRound();
  const { data: allBets, isLoading: betsLoading } = useAllBetsForRound(
    currentRound?.id,
  );
  const { data: allRounds } = useAllRounds();
  const { data: roundResult } = useRoundResult(
    currentRound?.status === Variant_closed_open_declared.declared
      ? currentRound.id
      : undefined,
  );

  const createRound = useCreateRound();
  const closeRound = useCloseRound();
  const declareWinner = useDeclareWinner();

  const [roundName, setRoundName] = useState("");
  const [selectedWinner, setSelectedWinner] = useState<number | null>(null);

  const handleCreateRound = async () => {
    if (!roundName.trim()) {
      toast.error("Round ka naam daalo!");
      return;
    }
    try {
      await createRound.mutateAsync(roundName.trim());
      toast.success(`Round "${roundName}" create ho gaya! ✅`);
      setRoundName("");
    } catch {
      toast.error("Round create nahi hua. Try again.");
    }
  };

  const handleCloseRound = async () => {
    if (!currentRound) return;
    try {
      await closeRound.mutateAsync(currentRound.id);
      toast.success("Betting band ho gayi!");
    } catch {
      toast.error("Round close nahi hua.");
    }
  };

  const handleDeclareWinner = async () => {
    if (!currentRound || selectedWinner === null) {
      toast.error("Winning number chunoo!");
      return;
    }
    try {
      await declareWinner.mutateAsync({
        roundId: currentRound.id,
        winningNumber: BigInt(selectedWinner),
      });
      toast.success(`Number ${selectedWinner} winner declare ho gaya! 🎉`);
      setSelectedWinner(null);
    } catch {
      toast.error("Winner declare nahi hua.");
    }
  };

  const isOpen = currentRound?.status === Variant_closed_open_declared.open;
  const isClosed = currentRound?.status === Variant_closed_open_declared.closed;
  const isDeclared =
    currentRound?.status === Variant_closed_open_declared.declared;

  const betRows = (allBets ?? []).flatMap((bet) =>
    bet.numberBets.map((nb) => ({
      member: `${bet.memberId.toString().slice(0, 12)}...`,
      number: Number(nb.number),
      amount: nb.amount,
    })),
  );

  const pastDeclaredRounds = (allRounds ?? []).filter(
    (r) =>
      r.status === Variant_closed_open_declared.declared &&
      r.id !== currentRound?.id,
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="w-6 h-6 text-gold" />
        <h2 className="text-xl font-black text-gradient-gold">Admin Panel</h2>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="w-full mb-6 bg-card border border-border">
          <TabsTrigger data-ocid="admin.tab" value="manage" className="flex-1">
            ⚙️ Manage
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.tab" value="bets" className="flex-1">
            📊 All Bets
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.tab" value="history" className="flex-1">
            📜 History
          </TabsTrigger>
        </TabsList>

        {/* MANAGE TAB */}
        <TabsContent value="manage">
          <div className="space-y-4">
            {!currentRound || isDeclared ? (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="font-bold mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-gold" /> Nayi Round Banao
                </p>
                <div className="flex gap-2">
                  <Input
                    data-ocid="admin.input"
                    placeholder="Round ka naam (e.g. Morning Game)"
                    value={roundName}
                    onChange={(e) => setRoundName(e.target.value)}
                    className="flex-1 bg-muted border-border"
                  />
                  <Button
                    data-ocid="admin.primary_button"
                    onClick={handleCreateRound}
                    disabled={createRound.isPending}
                    className="bg-gold text-primary-foreground hover:bg-gold-light"
                  >
                    {createRound.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </div>
            ) : null}

            {roundLoading ? (
              <Skeleton
                data-ocid="admin.loading_state"
                className="h-32 w-full"
              />
            ) : currentRound && !isDeclared ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Active Round
                    </p>
                    <p className="font-black text-lg">
                      {currentRound.roundName}
                    </p>
                  </div>
                  <Badge
                    className={
                      isOpen
                        ? "bg-green-700/30 text-green-400 border-green-700"
                        : "bg-yellow-700/30 text-yellow-400 border-yellow-700"
                    }
                  >
                    {isOpen ? "🟢 Open" : "🟡 Closed"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {betRows.length} bets placed
                  </span>
                </div>

                {isOpen && (
                  <Button
                    data-ocid="admin.secondary_button"
                    variant="outline"
                    className="w-full mb-3 border-yellow-600 text-yellow-400 hover:bg-yellow-900/30"
                    onClick={handleCloseRound}
                    disabled={closeRound.isPending}
                  >
                    {closeRound.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    Betting Band Karo
                  </Button>
                )}

                {isClosed && (
                  <div>
                    <p className="text-sm font-bold text-gold mb-3">
                      Winning Number Chunoo:
                    </p>
                    <div className="grid grid-cols-5 gap-3 mb-4">
                      {NUMBERS.map((n) => (
                        <NumberTile
                          key={n}
                          number={n}
                          selected={selectedWinner === n}
                          onClick={() =>
                            setSelectedWinner(n === selectedWinner ? null : n)
                          }
                          showAmount={false}
                          size="sm"
                        />
                      ))}
                    </div>
                    <Button
                      data-ocid="admin.confirm_button"
                      className="w-full bg-gold text-primary-foreground font-black hover:bg-gold-light"
                      onClick={handleDeclareWinner}
                      disabled={
                        declareWinner.isPending || selectedWinner === null
                      }
                    >
                      {declareWinner.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                          Declaring...
                        </>
                      ) : (
                        `🏆 Number ${selectedWinner ?? "?"} Ko Winner Banao`
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : null}

            {isDeclared && roundResult && (
              <WinnerDisplay
                result={roundResult}
                roundName={currentRound?.roundName}
              />
            )}
          </div>
        </TabsContent>

        {/* ALL BETS TAB */}
        <TabsContent value="bets">
          {betsLoading ? (
            <Skeleton data-ocid="admin.loading_state" className="h-48 w-full" />
          ) : betRows.length === 0 ? (
            <div data-ocid="admin.empty_state" className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Abhi koi bets nahi hain.</p>
            </div>
          ) : (
            <div
              data-ocid="admin.table"
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/20">
                    <TableHead className="text-muted-foreground">#</TableHead>
                    <TableHead className="text-muted-foreground">
                      Member
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Number
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {betRows.map((row, i) => (
                    <TableRow
                      key={`${row.member}-${row.number}-${i}`}
                      data-ocid={`admin.row.${i + 1}`}
                      className="border-border hover:bg-muted/10"
                    >
                      <TableCell className="text-muted-foreground text-xs">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.member}
                      </TableCell>
                      <TableCell>
                        <NumberTile
                          number={row.number}
                          size="sm"
                          showAmount={false}
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold text-gold">
                        ₹{row.amount.toString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
          {pastDeclaredRounds.length === 0 ? (
            <div data-ocid="admin.empty_state" className="text-center py-16">
              <p className="text-muted-foreground">
                Koi purani rounds nahi hain.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastDeclaredRounds.slice(0, 10).map((r, i) => (
                <PastRoundResult
                  key={r.id.toString()}
                  roundId={r.id}
                  roundName={r.roundName}
                  index={i}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PastRoundResult({
  roundId,
  roundName,
  index,
}: { roundId: bigint; roundName: string; index: number }) {
  const { data: result } = useRoundResult(roundId);
  if (!result) return <Skeleton className="h-24 w-full" />;
  return (
    <motion.div
      data-ocid={`admin.item.${index + 1}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <WinnerDisplay result={result} roundName={roundName} />
    </motion.div>
  );
}
