"use strict";
/** // TODO //
 * player profile pictures
 */
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-expect-error
const socket = io('https://sevens-73tl.onrender.com', { withCredentials: true });
const cardBack = '🂠';
const animationDuration_ms = parseInt(Array.from(document.styleSheets[0].cssRules)
    .filter((rule) => rule.selectorText === '.moving')[0].style.animationDuration);
var SortingMode;
(function (SortingMode) {
    SortingMode[SortingMode["None"] = 0] = "None";
    SortingMode[SortingMode["ByRank"] = 1] = "ByRank";
    SortingMode[SortingMode["BySuit"] = 2] = "BySuit";
})(SortingMode || (SortingMode = {}));
let sortingMode = SortingMode.None;
// socket listenrs
let userCount = 0;
socket.on('userCount', (count) => {
    userCount = count;
});
socket.on('tenScore_in', (newTenScore) => {
    tenScore = newTenScore;
});
socket.on('direction_in', (newDirection) => {
    state.direction = newDirection;
});
let names = [];
socket.on('names_in', (newNames) => {
    names = [...newNames];
    updateOpponentHandDiv();
});
let socketIndex = -1;
let state = {
    playerCount: 0,
    scores: [],
    roundsPlayed: 0,
    hands: [],
    table: {},
    lastTurnIndex: -1,
    turnIndex: -1,
    socketIndex: -1,
    requestingCard: false,
    givingCard: false,
    cardPlayed: null,
    gameStart: false,
    gameOver: false,
    direction: Direction.Clockwise,
};
socket.on('state_in', (stateString) => {
    state = parseStateString(stateString);
    if (state.socketIndex !== -1) {
        socketIndex = state.socketIndex;
    }
    if (state.turnIndex === socketIndex) {
        handleClientTurn();
    }
    else {
        handleOpponentTurn();
    }
    if (state.gameOver) {
        handleGameOver();
    }
});
// HTML elements
const root = document.querySelector(':root');
const startGameMenuItem = document.getElementById('start-game-menuitem');
const viewScoreboardMenuItem = document.getElementById('view-scoreboard-menuitem');
const editRulesMenuItem = document.getElementById('edit-rules-menuitem');
const editProfileMenuitem = document.getElementById('edit-profile-menuitem');
const opponentHandDiv = document.getElementById('opponent-hand-div');
const opponentHandOverlay = document.getElementById('opponent-hand-overlay');
const tableDiv = document.getElementById('table-div');
const tableOverlay = document.getElementById('table-overlay');
const tableTable = document.getElementById('table-table');
const sortByRankMenuItem = document.getElementById('sort-by-rank-menuitem');
const sortBySuitMenuItem = document.getElementById('sort-by-suit-menuitem');
const requestCardMenuItem = document.getElementById('request-card-menuitem');
const clientHandDiv = document.getElementById('client-hand-div');
const clientHandOverlay = document.getElementById('client-hand-overlay');
const divWidth = clientHandDiv.clientWidth;
const cardsPerRow = 7;
const cardWidth = (Math.floor(divWidth / cardsPerRow) - (cardsPerRow - 1)) * 0.8;
const cardHeight = Math.floor(cardWidth * 2);
// HTML listeners
startGameMenuItem.onclick = (evt) => { startGame(); };
viewScoreboardMenuItem.onclick = (evt) => {
    if (isOpponentHandOverlayVisible() &&
        !isRulesOverlayOpen() &&
        !isProfileOverlayOpen()) {
        hideOpponentHandOverlay();
        closeScoreOverlay();
        return;
    }
    closeRulesOverlay();
    closeProfileOverlay();
    opponentHandOverlay.style.visibility = '';
    viewScoreboardMenuItem.className = 'special';
    viewScoreboardMenuItem.innerHTML = 'Close Scoreboard';
    opponentHandOverlay.replaceChildren(makeScoreTable());
};
editRulesMenuItem.onclick = (evt) => {
    if (isOpponentHandOverlayVisible() &&
        !isScoreOverlayOpen() &&
        !isProfileOverlayOpen()) {
        hideOpponentHandOverlay();
        closeRulesOverlay();
        return;
    }
    closeScoreOverlay();
    closeProfileOverlay();
    opponentHandOverlay.style.visibility = '';
    editRulesMenuItem.className = 'special';
    editRulesMenuItem.innerHTML = 'Close Game Rules';
    opponentHandOverlay.replaceChildren(makeRulesForm());
};
editProfileMenuitem.onclick = (evt) => {
    if (isOpponentHandOverlayVisible() &&
        !isScoreOverlayOpen() &&
        !isRulesOverlayOpen()) {
        hideOpponentHandOverlay();
        closeProfileOverlay();
        return;
    }
    closeScoreOverlay();
    closeRulesOverlay();
    opponentHandOverlay.style.visibility = '';
    editProfileMenuitem.className = 'special';
    editProfileMenuitem.innerHTML = 'Close Profile';
    opponentHandOverlay.replaceChildren(makeProfileForm());
};
sortByRankMenuItem.onclick = (evt) => {
    sortingMode = SortingMode.ByRank;
    updateClientHandDiv();
};
sortBySuitMenuItem.onclick = (evt) => {
    sortingMode = SortingMode.BySuit;
    updateClientHandDiv();
};
function hideOpponentHandOverlay() {
    opponentHandOverlay.style.visibility = 'hidden';
}
function closeScoreOverlay() {
    viewScoreboardMenuItem.innerHTML = 'View Scoreboard';
    viewScoreboardMenuItem.className = '';
}
function closeRulesOverlay() {
    editRulesMenuItem.innerHTML = 'Edit Game Rules';
    editRulesMenuItem.className = '';
}
function closeProfileOverlay() {
    editProfileMenuitem.innerHTML = 'Edit Profile';
    editProfileMenuitem.className = '';
}
function isOpponentHandOverlayVisible() {
    return opponentHandOverlay.style.visibility !== 'hidden';
}
function isScoreOverlayOpen() {
    return viewScoreboardMenuItem.classList.contains('special');
}
function isRulesOverlayOpen() {
    return editRulesMenuItem.classList.contains('special');
}
function isProfileOverlayOpen() {
    return editProfileMenuitem.classList.contains('special');
}
function getNextTurnIndex() {
    return (state.direction === 'cw' ? (state.turnIndex + 1) % state.playerCount :
        (state.turnIndex + state.playerCount - 1) % state.playerCount);
}
function getLastTurnIndex() {
    return (state.direction === 'cw' ? (state.turnIndex + state.playerCount - 1) % state.playerCount :
        (state.turnIndex + 1) % state.playerCount);
}
function isFirstTurn() {
    return state.lastTurnIndex === -1;
}
function isClientTurn() {
    return state.turnIndex === socketIndex && socketIndex !== -1;
}
function wasClientTurn() {
    return state.lastTurnIndex === socketIndex && socketIndex !== -1;
}
function cardJustGiven() {
    return state.lastTurnIndex === state.turnIndex;
}
function clientJustGaveCard() {
    return cardJustGiven() &&
        state.turnIndex === socketIndex &&
        socketIndex !== -1;
}
function clientJustReceivedCard() {
    return cardJustGiven() &&
        getLastTurnIndex() === socketIndex &&
        socketIndex !== -1;
}
function getMovingElementsCount() {
    return document.getElementsByClassName('moving').length;
}
function makeCardElement(card) {
    const element = document.createElement('a');
    element.style = `
    padding: 0px;
    font-size: ${cardHeight * 0.8}px;
    margin: 0px 1px;
    cursor: pointer;
    background-color: white;
  `;
    if (card !== null) {
        element.innerHTML = card.toString();
        if (!isCardPlayable(card)) {
            element.className = 'unplayable';
            element.style.color =
                card.suit === CardSuit.Diamonds || card.suit === CardSuit.Hearts
                    ? 'lightpink'
                    : 'lightgray';
        }
        else {
            element.style.color =
                card.suit === CardSuit.Diamonds || card.suit === CardSuit.Hearts
                    ? 'red'
                    : 'black';
        }
    }
    else {
        element.style.color = '#2200dd';
        element.innerHTML = cardBack;
        element.onclick = null;
    }
    if (!isCardPlayable(card)) {
        element.style.cursor = '';
    }
    return { card: card, element: element };
}
const cardStrings = [
    cardBack,
    ...Card.getDeck()
        .map((card) => card.toString())
];
function isCardElement(element) {
    return cardStrings.includes(element.innerHTML);
}
function makeScoreTable() {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const labelHeaderCell = document.createElement('td');
    headerRow.appendChild(labelHeaderCell);
    for (let i = 0; i < state.playerCount; i++) {
        const cell = document.createElement('td');
        cell.innerHTML = `${names[i]}`;
        headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);
    for (let i = 0; i < state.scores.length; i++) {
        const row = document.createElement('tr');
        const labelCell = document.createElement('td');
        labelCell.innerHTML = `[${1 + i}]`;
        row.append(labelCell);
        const minScore = Math.min(...state.scores[i]);
        for (const score of state.scores[i]) {
            const cell = document.createElement('td');
            cell.innerHTML = `${score}`;
            if (i === 6 && score === minScore)
                cell.className = 'special';
            row.append(cell);
        }
        table.append(row);
    }
    return table;
}
function makeRulesForm() {
    const form = document.createElement('form');
    form.innerHTML = `
    <fieldset>
      <legend>Score value of 10s</legend>

      <div>
        <input type="radio" id="ten-score-5"  name="ten-score" value="5" ${tenScore === 5 ? 'checked="true"' : ''} />
        <label for="ten-score-5">5</label>

        <input type="radio" id="ten-score-10" name="ten-score" value="10" ${tenScore === 10 ? 'checked="true"' : ''} />
        <label for="ten-score-10">10</label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Turn direction</legend>

      <div>
        <input type="radio" id="direction-cw"  name="direction" value="cw" ${state.direction === 'cw' ? 'checked="true"' : ''} />
        <label for="direction-cw">Clockwise</label>

        <input type="radio" id="direction-ccw" name="direction" value="ccw" ${state.direction === 'ccw' ? 'checked="true"' : ''} />
        <label for="direction-ccw">Counter-Clockwise</label>
      </div>
    </fieldset>
  `;
    form.onchange = (evt) => {
        const data = new FormData(form);
        const newTenScore = +data.get('ten-score').toString();
        const newDirection = data.get('direction').toString();
        socket.emit('tenScore_out', newTenScore);
        socket.emit('direction_out', newDirection);
    };
    return form;
}
function makeProfileForm() {
    const form = document.createElement('div');
    form.innerHTML = `
    <div>
      <label for="profile-name-input">Name</label>
      <input type="text" id="profile-name-input" name="profile" placeholder="Player ${1 + socketIndex}" />
    </div>
  `;
    form.onchange = (evt) => {
        const input = document.getElementById('profile-name-input');
        const name = input.value || input.placeholder;
        names[socketIndex] = name;
        sendNames();
    };
    return form;
}
function updateOpponentHandDiv() {
    opponentHandDiv.replaceChildren(opponentHandOverlay);
    for (let i = 0; i < state.playerCount; i++) {
        if (i === socketIndex)
            continue;
        const element = makeCardElement(null);
        const countLabel = document.createElement('a');
        countLabel.style.paddingTop = '3vh';
        countLabel.style.whiteSpace = 'pre-line';
        countLabel.innerHTML = `${names[i]}\nx${state.hands[i].length}`;
        opponentHandDiv.append(element.element, countLabel);
    }
}
function updateClientHandDiv() {
    clientHandDiv.replaceChildren(clientHandOverlay);
    sortCards(state.hands[socketIndex]);
    for (const card of state.hands[socketIndex]) {
        const cardElement = makeCardElement(card);
        if (cardElement.element.className !== 'unplayable') {
            cardElement.element.onclick = (evt) => {
                handleCardElementPress(cardElement);
            };
        }
        clientHandDiv.appendChild(cardElement.element);
    }
}
function updateTableDiv() {
    for (const key of Object.keys(state.table)) {
        const pile = state.table[key];
        const highCell = document.getElementById(`${key}-high-cell`);
        const lowCell = document.getElementById(`${key}-low-cell`);
        if (pile.length === 0) {
            highCell.replaceChildren(makeCardElement(null).element);
            lowCell.replaceChildren(makeCardElement(null).element);
            continue;
        }
        const sortedPile = pile.toSorted((a, b) => cardRankToNumber[a.rank] - cardRankToNumber[b.rank]);
        const highCard = sortedPile[sortedPile.length - 1];
        const lowCard = sortedPile[0];
        lowCell.replaceChildren(makeCardElement(lowCard).element);
        if (pile.length > 1) {
            highCell.replaceChildren(makeCardElement(highCard).element);
        }
    }
}
function updateHTML() {
    updateOpponentHandDiv();
    updateClientHandDiv();
    animateLastTurn();
    setTimeout(updateTableDiv, wasClientTurn() || isFirstTurn() ? 0 : animationDuration_ms);
}
function setAnimationEndPoint(start, end) {
    root.style.setProperty('--end-position-top', `${end.top - start.top}px`);
    root.style.setProperty('--end-position-left', `${end.left - start.left}px`);
}
function animateGhostCard(card, sourceDiv, sourceChildArray, sourceHandAnchors, index) {
    const ghostCardElement = makeCardElement(card);
    const replacementIndex = sourceChildArray.findIndex((element) => element === sourceHandAnchors[index]);
    const replacedChild = sourceChildArray[replacementIndex];
    sourceDiv.replaceChildren(...sourceChildArray.slice(0, replacementIndex), ghostCardElement.element, ...sourceChildArray.slice(replacementIndex + 1));
    ghostCardElement.element.className = 'moving';
    setTimeout(() => {
        sourceDiv.replaceChildren(...sourceChildArray.slice(0, replacementIndex), replacedChild, ...sourceChildArray.slice(replacementIndex + 1));
    }, animationDuration_ms);
}
function animateOpponentPlayedCard(card, opponentChildArray, opponentHandAnchors, opponentIndex) {
    const startRect = opponentHandAnchors[opponentIndex].getBoundingClientRect();
    const endRect = getTableDestinationAnchor(card).getBoundingClientRect();
    setAnimationEndPoint(startRect, endRect);
    animateGhostCard(card, opponentHandDiv, opponentChildArray, opponentHandAnchors, opponentIndex);
}
function animateClientReceivedCard(card, opponentChildArray, opponentHandAnchors, opponentIndex) {
    const startRect = opponentHandAnchors[opponentIndex].getBoundingClientRect();
    const cardElementInHand = Array.from(clientHandDiv.children).find((element) => element.innerHTML === card.toString());
    const endRect = cardElementInHand.getBoundingClientRect();
    setAnimationEndPoint(startRect, endRect);
    cardElementInHand.style.visibility = 'hidden';
    animateGhostCard(card, opponentHandDiv, opponentChildArray, opponentHandAnchors, opponentIndex);
    setTimeout(() => {
        cardElementInHand.style.visibility = '';
    }, animationDuration_ms);
}
function animateOpponentGaveCard(opponentChildArray, opponentHandAnchors, opponentIndex) {
    const startRect = opponentHandAnchors[opponentIndex].getBoundingClientRect();
    let otherIndex = getLastTurnIndex();
    if (otherIndex > socketIndex)
        otherIndex--;
    const endRect = opponentHandAnchors[otherIndex].getBoundingClientRect();
    setAnimationEndPoint(startRect, endRect);
    animateGhostCard(null, opponentHandDiv, opponentChildArray, opponentHandAnchors, opponentIndex);
}
function animateLastTurn() {
    if (state.playerCount === 1)
        return;
    if (state.gameOver)
        return;
    if (isFirstTurn() || wasClientTurn() || state.cardPlayed === null)
        return;
    const card = state.cardPlayed;
    const opponentHandAnchors = Array.from(opponentHandDiv.children).filter((element) => isCardElement(element));
    const opponentChildArray = Array.from(opponentHandDiv.children);
    let opponentIndex = isClientTurn() ? getLastTurnIndex() : state.turnIndex;
    if (opponentIndex > socketIndex)
        opponentIndex--;
    if (clientJustReceivedCard()) {
        animateClientReceivedCard(card, opponentChildArray, opponentHandAnchors, opponentIndex);
        return;
    }
    if (cardJustGiven()) {
        animateOpponentGaveCard(opponentChildArray, opponentHandAnchors, opponentIndex);
        return;
    }
    animateOpponentPlayedCard(card, opponentChildArray, opponentHandAnchors, opponentIndex);
}
function sortCards(cards) {
    cards.sort((a, b) => {
        const rankDiff = cardRankToNumber[a.rank] - cardRankToNumber[b.rank];
        const suitDiff = cardSuitToNumber[a.suit] - cardSuitToNumber[b.suit];
        return (sortingMode === SortingMode.ByRank ? rankDiff || suitDiff :
            sortingMode === SortingMode.BySuit ? suitDiff || rankDiff :
                0);
    });
}
function isCardPlayable(card) {
    if (card === null)
        return false;
    const previousCardPlayed = state.table[card.suit].filter((value) => value.rank === previousCardRank(card.rank)).length !== 0;
    const nextCardPlayed = state.table[card.suit].filter((value) => value.rank === nextCardRank(card.rank)).length !== 0;
    if (card.rank !== CardRank.Seven && !previousCardPlayed && !nextCardPlayed)
        return false;
    const spadePlayed = state.table[CardSuit.Spades].filter((value) => value.rank === card.rank).length !== 0;
    return card.suit === CardSuit.Spades || spadePlayed;
}
function getTableDestinationAnchor(card) {
    const pile = state.table[card.suit];
    if (pile.length === 0)
        return document.getElementById(`${card.suit}-low-cell`)?.children[0];
    const sortedPile = pile.toSorted((a, b) => cardRankToNumber[a.rank] - cardRankToNumber[b.rank]);
    const highCard = sortedPile[sortedPile.length - 1];
    if (cardRankToNumber[highCard.rank] < cardRankToNumber[card.rank])
        return document.getElementById(`${card.suit}-high-cell`)?.children[0];
    return document.getElementById(`${card.suit}-low-cell`)?.children[0];
}
function handleCardElementPress(cardElement) {
    if (socketIndex !== state.turnIndex ||
        cardElement === null ||
        cardElement.card === null ||
        !isCardPlayable(cardElement.card))
        return;
    if (getMovingElementsCount() > 0)
        return;
    const card = cardElement.card;
    const cardIndex = state.hands[socketIndex].findIndex((value) => value.equals(card));
    if (cardIndex === -1)
        return;
    const startRect = cardElement.element.getBoundingClientRect();
    const endRect = getTableDestinationAnchor(card).getBoundingClientRect();
    setAnimationEndPoint(startRect, endRect);
    cardElement.element.className = 'moving';
    setTimeout(() => {
        state.cardPlayed = card;
        state.table[card.suit].push(card);
        state.hands[socketIndex].splice(cardIndex, 1);
        if (state.hands[socketIndex].length === 0)
            endGame();
        sendState();
    }, animationDuration_ms);
}
function handleClientTurn() {
    updateHTML();
    clientHandOverlay.style.visibility = 'hidden';
    if (Array.from(clientHandDiv.children).filter((element) => !element.classList.contains('unplayable')
        && !element.classList.contains('overlay')).length === 0 && !state.gameOver) {
        enableCardRequest();
    }
    if (state.givingCard) {
        enableCardGive();
    }
}
function enableCardRequest() {
    requestCardMenuItem.style.visibility = '';
    requestCardMenuItem.onclick = (evt) => {
        requestCardMenuItem.style.visibility = 'hidden';
        state.requestingCard = true;
        state.cardPlayed = null;
        sendState();
    };
}
function enableCardGive() {
    tableOverlay.style.visibility = '';
    tableOverlay.innerHTML =
        `${names[state.lastTurnIndex]} is asking for a card!<br/>` +
            `Please click the card you want to give them`;
    for (let i = 0; i < state.hands[socketIndex].length; i++) {
        const card = state.hands[socketIndex][i];
        const anchor = clientHandDiv.children[1 + i];
        anchor.onclick = (evt) => {
            if (getMovingElementsCount() > 0)
                return;
            const startRect = anchor.getBoundingClientRect();
            let opponentIndex = getLastTurnIndex();
            if (opponentIndex > socketIndex)
                opponentIndex--;
            const endRect = Array.from(opponentHandDiv.children).filter((element) => isCardElement(element))[opponentIndex].getBoundingClientRect();
            setAnimationEndPoint(startRect, endRect);
            anchor.classList.add('moving');
            setTimeout(() => {
                tableOverlay.style.visibility = 'hidden';
                state.cardPlayed = card;
                state.hands[socketIndex].splice(i, 1);
                state.hands[state.lastTurnIndex].push(card);
                sendState();
                if (state.hands[socketIndex].length === 0)
                    endGame();
            }, animationDuration_ms);
        };
    }
}
function handleOpponentTurn() {
    updateHTML();
    clientHandOverlay.style.visibility = '';
    clientHandOverlay.innerHTML =
        state.givingCard ?
            `${names[state.turnIndex]} is selecting a card to give to ${names[state.lastTurnIndex]}...`
            : `It's ${names[state.turnIndex]}'s turn...`;
}
function handleGameOver() {
    const winnerIndex = state.scores.map((q, i) => ({ index: i, value: q }))
        .toSorted((a, b) => a.value[a.value.length - 1] - b.value[b.value.length - 1])[0]
        .index;
    clientHandOverlay.style.visibility = '';
    clientHandOverlay.innerHTML =
        `Game over!<br/>` +
            `${names[winnerIndex]} wins!`;
    opponentHandOverlay.style.visibility = 'hidden';
    viewScoreboardMenuItem.click();
    state.gameOver = false;
}
function sendState() {
    socket.emit('state_out', JSON.stringify(state));
}
function sendNames() {
    socket.emit('names_out', names);
}
function startGame() {
    if (state.roundsPlayed >= 7) {
        state.roundsPlayed = 0;
        state.scores = [];
    }
    state.playerCount = userCount;
    for (let i = 0; i < state.playerCount; i++)
        if (!names[i])
            names[i] = `Player ${1 + i}`;
    sendNames();
    state.socketIndex = -1;
    state.turnIndex = -1;
    const deck = Card.getDeck();
    deck.sort((a, b) => Math.random() < 0.5 ? -1 : 1);
    const hands = [];
    for (let i = 0; i < state.playerCount; i++)
        hands[i] = [];
    while (deck.length > 0) {
        for (let i = 0; i < state.playerCount && deck.length > 0; i++) {
            hands[i].push(deck[0]);
            deck.splice(0, 1);
        }
    }
    state.hands = [...hands];
    state.table = {};
    state.table[CardSuit.Spades] = [];
    state.table[CardSuit.Diamonds] = [];
    state.table[CardSuit.Clubs] = [];
    state.table[CardSuit.Hearts] = [];
    state.gameStart = true;
    sendState();
}
function endGame() {
    for (let i = 0; i < state.playerCount; i++) {
        if (!state.scores[state.roundsPlayed])
            state.scores[state.roundsPlayed] = [];
        if (!state.scores[state.roundsPlayed][i]) {
            state.scores[state.roundsPlayed][i] = 0;
        }
        const lastScore = state.roundsPlayed > 0 ? state.scores[state.roundsPlayed - 1][i] : 0;
        const score = state.hands[i].reduce((t, c) => t + c.score, 0);
        state.scores[state.roundsPlayed][i] = lastScore + score;
    }
    state.roundsPlayed++;
    if (state.roundsPlayed < 7)
        startGame();
    else
        state.gameOver = true;
}
