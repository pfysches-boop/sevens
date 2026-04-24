const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

app.use(express.static(__dirname))

const socketio = require('socket.io')
const io = new socketio.Server(server, {
  cors: {
    origin: 'https://pfysches-boop.github.io',
    methods: [ 'GET', 'POST' ],
    credentials: true
  }
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


let direction = 'cw'

const nextTurnIndex = (turnIndex, playerCount) =>
  direction === 'cw' ? (turnIndex + 1) % playerCount :
    (turnIndex + playerCount - 1) % playerCount 
const lastTurnIndex = (turnIndex, playerCount) =>
  direction !== 'cw' ? (turnIndex + 1) % playerCount :
    (turnIndex + playerCount - 1) % playerCount 



function getSocketAt(targetIndex) {
  const socketKeys = io.sockets.sockets.keys()
  let currentSocketKey
  let index = 0
  while(!((currentSocketKey = socketKeys.next()).done)) {
    const currentSocket = io.sockets.sockets.get(currentSocketKey.value)
    
    if(index === targetIndex) {
      return currentSocket
    }

    index++
  }
  return null
}

function forEachSocket(callback = (currentSocket, index) => {}) {
  
  const socketKeys = io.sockets.sockets.keys()
  let index = 0
  while(!((currentSocketKey = socketKeys.next()).done)) {
    const currentSocket = io.sockets.sockets.get(currentSocketKey.value)
    
    // currentSocket.emit('hands', JSON.stringify({ index: index, hands: hands }))

    callback(currentSocket, index)

    index++
  }
}


function handleGameStart(state) {

  state.lastTurnIndex = -1
  state.turnIndex = -1
  state.gameStart = false

  forEachSocket((currentSocket, index) => {
    if(
      state.hands[index]
        .filter(card => card.suit === '♠' && card.rank === '7')
        .length !== 0
    ) {
      state.turnIndex = index
    }
  })

  forEachSocket((currentSocket, index) => {
    state.socketIndex = index
    currentSocket.emit('state_in', JSON.stringify(state))
  })
}

function handleRequestingCard(state) {
  // sender   = turnIndex
  // receiver = nextTurnIndex
  state.requestingCard = false
  state.lastTurnIndex = state.turnIndex
  state.turnIndex = nextTurnIndex(state.turnIndex, state.playerCount)
  state.givingCard = true

  io.emit('state_in', JSON.stringify(state))
}

function handleGameOver(state) {
  io.emit('state_in', JSON.stringify(state))
}

function handleGivingCard(state) {
  state.lastTurnIndex = state.turnIndex
  state.givingCard = false
  io.emit('state_in', JSON.stringify(state))
}

let userCount = 0
io.on('connection', (socket) => {
  userCount++
  console.log(`a user connected! [${userCount}]`)
  io.emit('userCount', userCount)

  socket.on('disconnect', (reason) => {
    console.log('a user disconnected!')
    userCount--
    io.emit('userCount', userCount)
  })

  socket.on('tenScore_out', (newTenScore) => {
    io.emit('tenScore_in', newTenScore)
  })
  socket.on('direction_out', (newDirection) => {
    direction = newDirection
    io.emit('direction_in', newDirection)
  })
  socket.on('names_out', (names) => {
    io.emit('names_in', names)
  })

  socket.on('state_out', (stateString) => {
    const state = JSON.parse(stateString)

    if(state.gameStart) {
      handleGameStart(state)
      return
    }

    state.direction = direction
    state.socketIndex = -1

    if(state.gameOver) {
      handleGameOver(state)
      return
    }

    if(state.requestingCard) {
      handleRequestingCard(state)
      return
    }

    if(state.givingCard) {
      handleGivingCard(state)
      return
    }

    state.lastTurnIndex = state.turnIndex
    state.turnIndex = nextTurnIndex(state.turnIndex, state.playerCount)
    io.emit('state_in', JSON.stringify(state))
  })



})


const port = 4000
server.listen(port, () => {
  console.log(`listening on *:${port}`)
})