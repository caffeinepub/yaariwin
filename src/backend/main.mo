import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Data Types
  type GameRound = {
    id : Nat;
    status : {
      #open;
      #closed;
      #declared;
    };
    winningNumber : ?Nat;
    createdAt : Int;
    roundName : Text;
  };

  type NumberBet = {
    number : Nat;
    amount : Nat;
  };

  type Bet = {
    memberId : Principal;
    roundId : Nat;
    numberBets : [NumberBet];
    timestamp : Int;
  };

  type RoundResult = {
    roundId : Nat;
    winningNumber : Nat;
    winnerId : ?Principal;
    winnerBetAmount : Nat;
    winnerPayout : Nat;
    allWinnerCandidates : [Bet];
  };

  public type UserProfile = {
    name : Text;
  };

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  let rounds = Map.empty<Nat, GameRound>();
  let bets = Map.empty<Nat, Bet>(); // Key: Bet ID
  let roundResults = Map.empty<Nat, RoundResult>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextRoundId = 1;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Create new round (Admin only)
  public shared ({ caller }) func createRound(roundName : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create rounds");
    };

    // Ensure no active round
    let activeRoundExists = rounds.values().toArray().any(func(r) { r.status == #open });
    if (activeRoundExists) {
      Runtime.trap("There is already an active round.");
    };

    let newRound : GameRound = {
      id = nextRoundId;
      status = #open;
      winningNumber = null;
      createdAt = Time.now();
      roundName;
    };
    rounds.add(nextRoundId, newRound);
    nextRoundId += 1;
    newRound.id;
  };

  // Place bets (Members only)
  public shared ({ caller }) func placeBets(roundId : Nat, betsList : [NumberBet]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only members can place bets");
    };

    switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Round does not exist") };
      case (?round) {
        if (round.status != #open) { Runtime.trap("Bets can only be placed on open rounds") };

        let bet : Bet = {
          memberId = caller;
          roundId;
          numberBets = betsList;
          timestamp = Time.now();
        };

        bets.add(bets.size(), bet);
      };
    };
  };

  // Close bets for a round (Admin only)
  public shared ({ caller }) func closeRound(roundId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can close rounds");
    };

    switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Round does not exist") };
      case (?round) {
        if (round.status != #open) { Runtime.trap("Only open rounds can be closed") };

        let updatedRound = {
          round with
          status = #closed;
        };
        rounds.add(roundId, updatedRound);
      };
    };
  };

  // Declare winner for a round (Admin only)
  public shared ({ caller }) func declareWinner(roundId : Nat, winningNumber : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can declare winners");
    };

    if (winningNumber > 9) { Runtime.trap("Winning number must be between 0-9") };

    switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Round does not exist") };
      case (?round) {
        if (round.status != #closed) { Runtime.trap("Only closed rounds can be declared") };

        // Find all bets with the winning number
        let winningBets = bets.values().toArray().filter(func(b) { b.roundId == roundId and b.numberBets.values().any(func(nb) { nb.number == winningNumber }) });

        // Find bet with the least amount on the winning number
        var leastBet : ?Bet = null;
        var leastAmount : ?Nat = null;

        for (bet in winningBets.values()) {
          let betAmount = switch (bet.numberBets.findIndex(func(nb) { nb.number == winningNumber })) {
            case (?index) { bet.numberBets[index].amount };
            case (null) { 0 };
          };

          switch (leastAmount) {
            case (null) {
              leastAmount := ?(betAmount);
              leastBet := ?bet;
            };
            case (?amount) {
              if (betAmount < amount) {
                leastAmount := ?betAmount;
                leastBet := ?bet;
              };
            };
          };
        };

        // Calculate payout
        let winnerPayout = switch (leastAmount) {
          case (null) { 0 };
          case (?amount) { amount * 8 };
        };

        let result : RoundResult = {
          roundId;
          winningNumber;
          winnerId = leastBet.map(func(b) { b.memberId });
          winnerBetAmount = switch (leastAmount) {
            case (null) { 0 };
            case (?amount) { amount };
          };
          winnerPayout;
          allWinnerCandidates = winningBets;
        };

        roundResults.add(roundId, result);

        // Update round status
        let updatedRound = {
          round with
          status = #declared;
          winningNumber = ?winningNumber;
        };
        rounds.add(roundId, updatedRound);
      };
    };
  };

  // Get current round (anyone)
  public query ({ caller }) func getCurrentRound() : async ?GameRound {
    rounds.values().toArray().find(func(r) { r.status == #open });
  };

  // Get member's bets for a round (Members only)
  public query ({ caller }) func getMyBets(roundId : Nat) : async [Bet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only members can view their bets");
    };

    let myBets = bets.values().toArray().filter(func(b) { b.roundId == roundId and b.memberId == caller });
    myBets;
  };

  // Get round result (anyone)
  public query ({ caller }) func getRoundResult(roundId : Nat) : async ?RoundResult {
    roundResults.get(roundId);
  };

  // Get all rounds (anyone)
  public query ({ caller }) func getAllRounds() : async [GameRound] {
    rounds.values().toArray();
  };

  // Get all bets for a round (Admin only)
  public query ({ caller }) func getAllBetsForRound(roundId : Nat) : async [Bet] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all bets for a round");
    };

    let roundBets = bets.values().toArray().filter(func(b) { b.roundId == roundId });
    roundBets;
  };
};
