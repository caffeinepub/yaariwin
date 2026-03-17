import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RoundResult {
    winningNumber: bigint;
    winnerId?: Principal;
    roundId: bigint;
    allWinnerCandidates: Array<Bet>;
    winnerBetAmount: bigint;
    winnerPayout: bigint;
}
export interface Bet {
    memberId: Principal;
    numberBets: Array<NumberBet>;
    roundId: bigint;
    timestamp: bigint;
}
export interface GameRound {
    id: bigint;
    status: Variant_closed_open_declared;
    winningNumber?: bigint;
    createdAt: bigint;
    roundName: string;
}
export interface NumberBet {
    number: bigint;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_closed_open_declared {
    closed = "closed",
    open = "open",
    declared = "declared"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    closeRound(roundId: bigint): Promise<void>;
    createRound(roundName: string): Promise<bigint>;
    declareWinner(roundId: bigint, winningNumber: bigint): Promise<void>;
    getAllBetsForRound(roundId: bigint): Promise<Array<Bet>>;
    getAllRounds(): Promise<Array<GameRound>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentRound(): Promise<GameRound | null>;
    getMyBets(roundId: bigint): Promise<Array<Bet>>;
    getRoundResult(roundId: bigint): Promise<RoundResult | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeBets(roundId: bigint, betsList: Array<NumberBet>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
