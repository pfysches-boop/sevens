
enum Direction {
  Clockwise = 'cw',
  CounterClockwise = 'ccw',
}

type GameState = {
  playerCount: number,

  scores: number[][],
  roundsPlayed: number,

  hands: Card[][],
  table: { [key: string]: Card[] },
  
  lastTurnIndex: number,
  turnIndex: number,
  socketIndex: number,
  
  requestingCard: boolean,
  givingCard: boolean,

  cardPlayed: Card | null,
  
  gameStart: boolean,
  gameOver: boolean,
  
  direction: Direction,
}

type _CardReduced = { suit: CardSuit, rank: CardRank }
function parseStateString(stateString: string): GameState {
  const stateObject = JSON.parse(stateString)

  let state: GameState = {
    playerCount: stateObject.playerCount as number,

    scores: stateObject.scores as number[][],
    roundsPlayed: stateObject.roundsPlayed as number,

    hands: (stateObject.hands as _CardReduced[][]).map(
      (hand: _CardReduced[]) => hand.map(
        q => new Card(q.suit, q.rank)
      )
    ),
    table: Object.fromEntries(Object.entries(stateObject.table as { [key: string]: _CardReduced[] }).map(
      ([ key, value ]) => [ key, value.map(q => new Card(q.suit, q.rank)) ]
    )),

    lastTurnIndex: stateObject.lastTurnIndex as number,
    turnIndex:     stateObject.turnIndex     as number,
    socketIndex:   stateObject.socketIndex   as number,
    
    requestingCard: stateObject.requestingCard as boolean,
    givingCard: stateObject.givingCard as boolean,

    cardPlayed: stateObject.cardPlayed === null ? null : new Card(
      (stateObject.cardPlayed as _CardReduced).suit, (stateObject.cardPlayed as _CardReduced).rank
    ),
    
    gameStart: stateObject.gameStart as boolean,
    gameOver:  stateObject.gameOver  as boolean,
    
    direction: stateObject.direction as Direction,
  }

  return state
}
