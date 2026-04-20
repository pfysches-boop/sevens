const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const cors = require('cors')

app.use(cors({
  origin: 'https://pfysches-boop.github.io',
  optionsSuccessStatus: 200,
}))

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "React app URL"
  )
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  next()
})

app.use(express.static(__dirname))

const socketio = require('socket.io')
const io = new socketio.Server(server)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


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


let direction = 'cw'

let userCount = 0
io.on('connection', socket => {
  userCount++
  console.log(`a user connected! [${userCount}]`)
  io.emit('userCount', userCount)

  socket.on('disconnect', reason => {
    console.log('a user disconnected!')
    userCount--
    io.emit('userCount', userCount)
  })

  socket.on('startGame', (handsString) => {
    const hands = JSON.parse(handsString)

    let socketKeys = io.sockets.sockets.keys()
    let currentSocketKey
    let index = 0
    while(!((currentSocketKey = socketKeys.next()).done)) {
      const currentSocket = io.sockets.sockets.get(currentSocketKey.value)

      if(hands[index].filter(card => card.suit === '♠' && card.rank === '7').length !== 0) {
        io.emit('turn', index)
      }
      
      index++
    }

    socketKeys = io.sockets.sockets.keys()
    index = 0
    while(!((currentSocketKey = socketKeys.next()).done)) {
      const currentSocket = io.sockets.sockets.get(currentSocketKey.value)
      
      currentSocket.emit('hands', JSON.stringify({ index: index, hands: hands }))

      index++
    }

  })

  socket.on('tableOut', tableString => {
    io.emit('table', tableString)
  })

  socket.on('handsOut', handsString => {
    io.emit('hands', JSON.stringify({ index: -1, hands: JSON.parse(handsString) }))
  })

  socket.on('turnOut', (turnIndex, playerCount) => {
    const newTurnIndex =
      direction == 'cw' ? (turnIndex + 1) % playerCount :
      (turnIndex + playerCount - 1) % playerCount

    io.emit('turn', newTurnIndex)
  })

  socket.on('requestCardOut', (senderIndex, playerCount) => {
    const receiverIndex =
      direction === 'cw' ? (senderIndex + 1) % playerCount :
      (senderIndex + playerCount - 1) % playerCount

    getSocketAt(receiverIndex).emit('requestCard', senderIndex)
  })

  socket.on('cardGivenOut', (receiverIndex) => {
    getSocketAt(receiverIndex).emit('cardGiven')
  })

  socket.on('endGameOut', (scoresString, roundsPlayed) => {
    socket.broadcast.emit('scores', scoresString, roundsPlayed)

    if(roundsPlayed >= 7) {
      io.emit('gameOver')
    }    

    socket.emit('endGame')
  })

  socket.on('tenScoreOut', (score) => {
    io.emit('tenScore', score)
  })

  socket.on('directionOut', (newDirection) => {
    direction = newDirection
  })

  socket.on('playerCountOut', (playerCount) => {
    io.emit('playerCount', playerCount)
  })



})


const port = 4000
server.listen(port, () => {
  console.log(`listening on *:${port}`)
})
