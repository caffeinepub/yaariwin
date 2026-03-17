# YaariWin - Number Betting Game

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Number betting game with digits 0-9
- Admin panel: select winning number, manage rounds, view all bets
- Member panel: place bets on one or more numbers per round
- Payout: winner gets 8x the amount they bet on the winning number
- Winner selection rule: among all members who bet on the winning number, the one who bet the LEAST amount wins
- Bet amounts are flexible (member chooses how much to bet on each number)
- Round management: open/close betting, declare winner
- Leaderboard / results history
- Contact number: 9041725847 shown in footer
- Authorization (admin vs member roles)

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko):
   - GameRound type: id, status (open/closed/declared), winningNumber, createdAt
   - Bet type: memberId, roundId, bets: [(number, amount)], timestamp
   - Admin functions: createRound, closeRound, declareWinner(roundId, winningNumber)
   - Member functions: placeBet(roundId, bets)
   - Query functions: getCurrentRound, getMyBets, getRoundResults, getAllBets (admin)
   - Winner logic: among bettors on winning number, pick lowest bet amount; payout = betAmount * 8

2. Frontend:
   - Landing/login page with YaariWin branding
   - Member home: active round betting form (numbers 0-9 with amount inputs), my bet history
   - Admin dashboard: create round, view all bets, declare winner, results
   - Results page: winner announcement, payout info
   - Footer with contact: 9041725847
