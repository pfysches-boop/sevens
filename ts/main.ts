import { Socket } from "socket.io";


let scores: number[][] = []

/** // TODO //
 * end at seven rounds
*/


let roundsPlayed: number = 0
// @ts-expect-error
const socket: Socket = io()

let playerCount: number = 0
let userCount: number = 0
socket.on('userCount', (count: number) => {
  userCount = count
})
socket.on('playerCount', (count: number) => {
  playerCount = count
})

const startGameMenuItem: HTMLAnchorElement = document.getElementById('start-game-menuitem') as HTMLAnchorElement
startGameMenuItem.onclick = startGame
const editRulesMenuItem: HTMLAnchorElement = document.getElementById('edit-rules-menuitem') as HTMLAnchorElement

const highOverlayDiv: HTMLDivElement  = document.getElementById('high-overlay')      as HTMLDivElement
const mainOverlayDiv:  HTMLDivElement = document.getElementById('main-overlay')      as HTMLDivElement
const turnOverlayDiv:  HTMLDivElement = document.getElementById('turn-overlay')      as HTMLDivElement
const opponentHandDiv: HTMLDivElement = document.getElementById('opponent-hand-div') as HTMLDivElement
const viewScoreboardMenuItem: HTMLAnchorElement = document.getElementById('view-scoreboard-menuitem') as HTMLAnchorElement
const tableDiv:        HTMLDivElement = document.getElementById('table-div')         as HTMLDivElement
const tableTable: { [key: string]: { [key: string]: { element: HTMLElement, card: Card | null } } } = {
  '♠': {
    high: {
      element: document.getElementById('spades-high-cell') as HTMLElement,
      card: null,
    },
    low: {
      element: document.getElementById('spades-low-cell') as HTMLElement,
      card: null,
    }
  },
  '♦': {
    high: {
      element: document.getElementById('diamonds-high-cell') as HTMLElement,
      card: null,
    },
    low: {
      element: document.getElementById('diamonds-low-cell') as HTMLElement,
      card: null,
    },
  },
  '♣': {
    high: {
      element: document.getElementById('clubs-high-cell') as HTMLElement,
      card: null,
    },
    low: {
      element: document.getElementById('clubs-low-cell') as HTMLElement,
      card: null,
    },
  },
  '♥': {
    high: {
      element: document.getElementById('hearts-high-cell') as HTMLElement,
      card: null,
    },
    low: {
      element: document.getElementById('hearts-low-cell') as HTMLElement,
      card: null,
    },
  },
}
const requestCardMenuItem: HTMLAnchorElement = document.getElementById('request-card-menuitem') as HTMLAnchorElement
const clientHandDiv: HTMLDivElement = document.getElementById('client-hand-div') as HTMLDivElement

const divWidth: number = clientHandDiv.clientWidth
const cardsPerRow: number = 7
const cardWidth: number = Math.floor(divWidth / cardsPerRow) - (cardsPerRow - 1)
const cardHeight: number = Math.floor(cardWidth * 1.2)

type CardElement = { element: HTMLButtonElement, card: Card | null }
function makeCardElement(card: Card | null): CardElement {
  const element = document.createElement('button')

  element.style = `
    width: ${cardWidth}px;
    height: ${cardHeight}px;
    border: 1px solid black;
    border-radius: 3px;
    margin: 0px ${Math.floor((divWidth - cardWidth * cardsPerRow) / (2.25 * (cardsPerRow)))}px;
  `

  if(card !== null) {
    element.style.color = 
      card.suit === CardSuit.Diamonds || card.suit === CardSuit.Hearts
        ? 'red' 
      : 'black'
    element.innerHTML = card.rank + card.suit
    if(!isCardPlayable(card)) element.className = 'unplayable'
  } else {
    element.innerHTML = '🍍'
    element.disabled = true
  }

  return { element: element, card: card }
}

enum SortingMode {
  None,
  ByRank,
  BySuit
}
let sortingMode: SortingMode = SortingMode.None

viewScoreboardMenuItem.onclick = (evt: PointerEvent) => {
  if(!highOverlayDiv.style.visibility && !editRulesMenuItem.className) {
    highOverlayDiv.style.visibility = 'hidden'

    viewScoreboardMenuItem.innerHTML = 'View Scoreboard'
    viewScoreboardMenuItem.className = ''
    
    return
  }

  editRulesMenuItem.innerHTML = 'Edit Game Rules'
  editRulesMenuItem.className = ''

  viewScoreboardMenuItem.innerHTML = 'Hide Scoreboard'
  viewScoreboardMenuItem.className = 'special'
  highOverlayDiv.style.visibility = ''
  
  const scoresTable: HTMLTableElement = document.createElement('table')
  const headerRow: HTMLTableRowElement = document.createElement('tr')
  const headerRoundCell: HTMLTableCellElement = document.createElement('td')
  headerRoundCell.innerHTML = ''
  headerRow.appendChild(headerRoundCell)
  for(let i = 0; i < playerCount; i++) {
    const cell: HTMLTableCellElement = document.createElement('td')
    cell.innerHTML = `Player ${i + 1}`
    headerRow.appendChild(cell)
  }
  scoresTable.appendChild(headerRow)

  for(let i = 0; i < scores.length; i++) {
    const round = scores[i]
    const row: HTMLTableRowElement = document.createElement('tr')
    const labelCell: HTMLTableCellElement = document.createElement('td')
    labelCell.innerHTML = `[${i + 1}]`
    row.appendChild(labelCell)
    
    const leastScore = Math.min(...round)

    for(const score of round) {
      const cell: HTMLTableCellElement = document.createElement('td')
      cell.innerHTML = `${score}`

      if(i === 6 && score === leastScore) {
        cell.className = 'special'
      }

      row.appendChild(cell)

    }
    scoresTable.appendChild(row)
  }

  highOverlayDiv.replaceChildren(scoresTable)
}

editRulesMenuItem.onclick = (evt: PointerEvent) => {  
  if(!highOverlayDiv.style.visibility && !viewScoreboardMenuItem.className) {
    highOverlayDiv.style.visibility = 'hidden'

    editRulesMenuItem.innerHTML = 'Edit Game Rules'
    editRulesMenuItem.className = ''
    
    return
  }

  viewScoreboardMenuItem.innerHTML = 'View Scoreboard'
  viewScoreboardMenuItem.className = ''

  editRulesMenuItem.innerHTML = 'Close Game Rules'
  editRulesMenuItem.className = 'special'

  highOverlayDiv.style.visibility = ''
  
  const tenScoreForm: HTMLFormElement = document.createElement('form')
  tenScoreForm.innerHTML = `
    <fieldset>
      <legend>Score value of 10s:</legend>
      <div>
        <input type="radio" id="ten-score-5"  name="ten-score" value="5" checked="true" />
        <label for="ten-score-5">5</label>

        <input type="radio" id="ten-score-10" name="ten-score" value="10" />
        <label for="ten-score-10">10</label>
      </div>
    </fieldset>
  `

  tenScoreForm.onchange = (evt: Event) => {
    const score: number = +(evt.target as HTMLInputElement).value
    socket.emit('tenScoreOut', score)
  }

  const directionForm: HTMLFormElement = document.createElement('form')
  directionForm.innerHTML = `
    <fieldset>
      <legend>Turn direction:</legend>
      <div>
        <input type="radio" id="direction-cw"  name="direction" value="cw" checked="true" />
        <label for="direction-cw">Clockwise</label>

        <input type="radio" id="direction-ccw" name="direction" value="ccw" />
        <label for="direction-ccw">Counter-clockwise</label>
      </div>
    </fieldset>
  `

  directionForm.onchange = (evt: Event) => {
    const direction: string = (evt.target as HTMLInputElement).value

    socket.emit('directionOut', direction)
  }

  highOverlayDiv.replaceChildren(tenScoreForm, directionForm)
}

function setupTable(): void {
  Array.from(document.getElementsByClassName('spacer-cell')).forEach((cell: Element) => {
    (cell as HTMLTableCellElement).style.width = `${cardWidth}px`
  })
}


function startGame() {
  if(roundsPlayed >= 7) {
    roundsPlayed = 0
    scores = []
    socket.emit('endGameOut', JSON.stringify(scores), roundsPlayed)
  }

  socketIndex = -1
  turnIndex = -1

  playerCount = userCount
  socket.emit('playerCountOut', playerCount)

  const deck: Card[] = Card.getDeck()

  // shuffle deck
  deck.sort((a: Card, b: Card) => Math.random() < 0.5 ? -1 : 1)

  // deal
  const hands: Card[][] = []
  for(let i = 0; i < playerCount; i++) { hands[i] = [] }
  while(deck.length > 0) {
    for(let i = 0; i < playerCount && deck.length > 0; i++) {
      hands[i].push(deck[0])
      deck.splice(0, 1)
    }
  }

  tablePiles = {}
  tablePiles[CardSuit.Spades  ] = []
  tablePiles[CardSuit.Diamonds] = []
  tablePiles[CardSuit.Clubs   ] = []
  tablePiles[CardSuit.Hearts  ] = []

  socket.emit('tableOut', JSON.stringify(tablePiles))
  socket.emit('startGame', JSON.stringify(hands))
}

let turnIndex: number = -1
let socketIndex: number = -1
let hands: Card[][] = []
let tablePiles: { [key: string]: Card[] } = {}
  tablePiles[CardSuit.Spades  ] = []
  tablePiles[CardSuit.Diamonds] = []
  tablePiles[CardSuit.Clubs   ] = []
  tablePiles[CardSuit.Hearts  ] = []
  
socket.on('hands', (handsString: string) => {
  const handsParsed = JSON.parse(handsString) as 
    { index: number, hands: { suit: CardSuit, rank: CardRank }[][] }

  if(handsParsed.index !== -1)
    socketIndex = handsParsed.index
  hands = handsParsed.hands.map(hand => hand.map(q => new Card(q.suit, q.rank)))

  updateHands()
})

function updateHands(): void {
  if(socketIndex === -1) return

  for(const div of [ opponentHandDiv, clientHandDiv ])
    for(const child of Array.from(div.children))
      if(!child.classList.contains('overlay')) div.removeChild(child)

  
  sortCards()
  const clientHand: Card[] = hands[socketIndex]

  for(const card of clientHand) {
    const element: CardElement = makeCardElement(card)
    if(element.element.className !== 'unplayable')
      element.element.onclick = (evt: PointerEvent) => {
        handleCardPress(element)
      }
    clientHandDiv.appendChild(element.element)
  }

  for(let i = 0; i < hands.length; i++) {
    if(i === socketIndex) continue

    const element: CardElement = makeCardElement(null)
    const countLabel: HTMLAnchorElement = document.createElement('a')
    countLabel.innerHTML = `x${hands[i].length}`
    opponentHandDiv.append(element.element, countLabel)
  }


  if(turnIndex !== socketIndex && roundsPlayed < 7) {
    turnOverlayDiv.style.visibility = ''
    requestCardMenuItem.style.visibility = 'hidden'
    turnOverlayDiv.innerHTML = `It's player ${turnIndex + 1}'s turn...`
    mainOverlayDiv.style.visibility = 'hidden'
  } else {
    mainOverlayDiv.style.visibility = 'hidden'
    
    if(roundsPlayed >= 7) return

    turnOverlayDiv.style.visibility = 'hidden'
    
    const playableCount: number = clientHand.filter(
      (card: Card) => isCardPlayable(card)
    ).length
    requestCardMenuItem.style.visibility = playableCount > 0 ? 'hidden' : ''
  } 
}

function updateTable() {
  for(const key of Object.keys(tablePiles)) {
    
    if(tablePiles[key].length === 0) {
      tableTable[key].low.element.replaceChildren(makeCardElement(null).element)
      tableTable[key].low.card = null

      tableTable[key].high.element.replaceChildren(makeCardElement(null).element)
      tableTable[key].high.card = null

      continue
    }


    const sortedCards: Card[] = [...tablePiles[key]].sort(
      (a: Card, b: Card) => cardRankToNumber[a.rank] - cardRankToNumber[b.rank]
    )
    const highCard: Card = sortedCards[sortedCards.length - 1]
    const lowCard:  Card = sortedCards[0]

    tableTable[key].low.element.replaceChildren(makeCardElement(lowCard).element)
    tableTable[key].low.card = lowCard
    
    if(sortedCards.length > 1) {
      tableTable[key].high.element.replaceChildren(makeCardElement(highCard).element)
      tableTable[key].high.card = highCard
    }

  }

  const cells = tableDiv.getElementsByTagName('td')
  for(let i = 0; i < cells.length; i++) {
    if(cells[i].childElementCount !== 1) continue
    const button = cells[i].children[0] as HTMLButtonElement
    button.className = ''
    button.disabled = true
    button.onclick = null
  }

}

function isCardPlayable(card: Card): boolean {
  const hasPreviousCard: boolean = tablePiles[card.suit].filter(
    (value: Card) => value.rank === previousCardRank(card.rank)
  ).length !== 0
  const hasNextCard: boolean = tablePiles[card.suit].filter(
    (value: Card) => value.rank === nextCardRank(card.rank)
  ).length !== 0

  if(card.rank !== CardRank.Seven && !hasPreviousCard && !hasNextCard)
    return false


  const spadePlayed: boolean = tablePiles[CardSuit.Spades].filter(
    (value: Card) => value.rank === card.rank
  ).length !== 0

  return card.suit === CardSuit.Spades || spadePlayed
}

function takeTurn(card: Card | null): boolean {
  if(card !== null) {
    if(!isCardPlayable(card)) return false

    tablePiles[card.suit].push(card)
  }

  socket.emit('tableOut', JSON.stringify(tablePiles))
  socket.emit('turnOut', socketIndex, playerCount)
  return true
}

socket.on('table', (tableString: string) => {
  const tableParsed = JSON.parse(tableString) as
    { [key: string]: { suit: CardSuit, rank: CardRank }[] }
  
  for(const key of Object.keys(tableParsed)) {
    tablePiles[key] = tableParsed[key].map(q => new Card(q.suit, q.rank))
  }

  updateTable()
})

socket.on('turn', (newTurnIndex: number) => {
  turnIndex = newTurnIndex

})

function handleCardPress(cardElement: CardElement | null): void {
  if(cardElement !== null) {
    if(
      socketIndex !== turnIndex ||
      cardElement.card === null ||
      !takeTurn(cardElement.card)
    ) return

    const cardIndex: number = hands[socketIndex].findIndex(
      (value: Card) => value.equals(cardElement.card as Card)
    )
    if(cardIndex === -1) return
    
    hands[socketIndex].splice(cardIndex, 1)

    if(hands[socketIndex].length === 0) {
      endGame()
    }
  } else {
    takeTurn(null)
  }

  socket.emit('handsOut', JSON.stringify(hands))
}

const sortRankMenuItem = document.getElementById('sort-rank-menuitem') as HTMLAnchorElement
sortRankMenuItem.onclick = (evt: PointerEvent) => {
  if(socketIndex === -1) return
  
  sortingMode = SortingMode.ByRank
  updateHands()
}
const sortSuitMenuItem = document.getElementById('sort-suit-menuitem') as HTMLAnchorElement
sortSuitMenuItem.onclick = (evt: PointerEvent) => {
  if(socketIndex === -1) return
  
  sortingMode = SortingMode.BySuit
  updateHands()
}

function sortCards() {
  if(socketIndex === -1) return

  hands[socketIndex].sort(
    (a: Card, b: Card) => {
      const rankDiff: number = cardRankToNumber[a.rank] - cardRankToNumber[b.rank]
      const suitDiff: number = cardSuitToNumber[a.suit] - cardSuitToNumber[b.suit]

      return (
        sortingMode === SortingMode.ByRank ? rankDiff || suitDiff :
        sortingMode === SortingMode.BySuit ? suitDiff || rankDiff :
        0
      )
    }
  )
}

requestCardMenuItem.onclick = (evt: PointerEvent) => {
  socket.emit('requestCardOut', socketIndex, playerCount)
}


socket.on('requestCard', (senderIndex: number) => {
  turnOverlayDiv.style.visibility = 'hidden'
  mainOverlayDiv.style.visibility = ''
  mainOverlayDiv.innerHTML = `Player ${senderIndex + 1} is asking for a card!<br/>`
    + `Please click the card you want to give them`

  for(let i = 0; i < hands[socketIndex].length; i++) {

    const card: Card = hands[socketIndex][i]
    const button: HTMLButtonElement = clientHandDiv.children[1 + i] as HTMLButtonElement

    button.className = isCardPlayable(card) ? '' : 'unplayable'

    button.onclick = (evt: PointerEvent) => {
      hands[socketIndex].splice(i, 1)


      hands[senderIndex].push(card)
      socket.emit('handsOut', JSON.stringify(hands))
      socket.emit('cardGivenOut', senderIndex)

      if(hands[socketIndex].length === 0) endGame()
    }
  }
})

socket.on('cardGiven', () => {
  handleCardPress(null)
})

function endGame() {
  for(let i = 0; i < playerCount; i++) {
    if(!scores[roundsPlayed]) scores[roundsPlayed] = []
    if(!scores[roundsPlayed][i]) { scores[roundsPlayed][i] = 0 }
    
    const lastScore: number = roundsPlayed > 0 ? scores[roundsPlayed - 1][i] : 0
    const score: number = hands[i].reduce((t: number, c: Card) => t + c.score, 0)
    scores[roundsPlayed][i] = lastScore + score
  }

  socket.emit('endGameOut', JSON.stringify(scores), ++roundsPlayed)  
}

socket.on('scores', (scoresString: string, rounds: number) => {
  scores = JSON.parse(scoresString)
  roundsPlayed = rounds
})

socket.on('endGame', () => {
  if(roundsPlayed < 7)
    startGame()
})

socket.on('tenScore', (score: number) => {
  tenScore = score
})

socket.on('gameOver', () => {
  turnOverlayDiv.style.visibility = ''
  const winner =
    Array(playerCount).fill(0).map((q: number, i: number) => i)
      .sort((a: number, b: number) =>
        scores[roundsPlayed - 1][a] - scores[roundsPlayed - 1][b]
      )[0]
  turnOverlayDiv.replaceChildren()
  turnOverlayDiv.innerText = `Game over! Player ${winner + 1} wins!`
  viewScoreboardMenuItem.click()
})



setupTable()