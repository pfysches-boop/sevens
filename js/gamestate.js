var Direction;
(function (Direction) {
    Direction["Clockwise"] = "cw";
    Direction["CounterClockwise"] = "ccw";
})(Direction || (Direction = {}));
function parseStateString(stateString) {
    const stateObject = JSON.parse(stateString);
    let state = {
        playerCount: stateObject.playerCount,
        scores: stateObject.scores,
        roundsPlayed: stateObject.roundsPlayed,
        hands: stateObject.hands.map((hand) => hand.map(q => new Card(q.suit, q.rank))),
        table: Object.fromEntries(Object.entries(stateObject.table).map(([key, value]) => [key, value.map(q => new Card(q.suit, q.rank))])),
        lastTurnIndex: stateObject.lastTurnIndex,
        turnIndex: stateObject.turnIndex,
        socketIndex: stateObject.socketIndex,
        requestingCard: stateObject.requestingCard,
        givingCard: stateObject.givingCard,
        cardPlayed: stateObject.cardPlayed === null ? null : new Card(stateObject.cardPlayed.suit, stateObject.cardPlayed.rank),
        gameStart: stateObject.gameStart,
        gameOver: stateObject.gameOver,
        direction: stateObject.direction,
    };
    return state;
}
