const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const roomManager = require('./utils/roomManager');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://skribbl-bdarija.vercel.app", "https://skribbl-bdarija.vercel.app/"],
    methods: ["GET", "POST"]
  }
});

const playerReactionTimes = new Map();

app.post('/api/rooms', (req, res) => {
  const { playerName, settings } = req.body;
  const playerId = uuidv4();
  const player = { id: playerId, name: playerName, score: 0, isHost: true };
  const roomCode = roomManager.createRoom(player, settings);
  res.json({ roomCode, playerId, player });
});

app.post('/api/rooms/:roomCode/join', (req, res) => {
  const { roomCode } = req.params;
  const { playerName } = req.body;
  const playerId = uuidv4();
  const player = { id: playerId, name: playerName, score: 0, isHost: false };
  
  const room = roomManager.joinRoom(roomCode, player);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({ roomCode, playerId, player });
});

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentPlayer = null;

  socket.on('joinRoom', ({ roomCode, playerId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('roomNotFound');
      return;
    }

    currentRoom = roomCode;
    currentPlayer = room.players.find(p => p.id === playerId);
    
    if (!currentPlayer) {
      socket.emit('roomNotFound');
      return;
    }

    currentPlayer.socketId = socket.id;
    socket.join(roomCode);
    socket.emit('playerInfo', currentPlayer);

    const gameState = {
      players: room.players,
      currentDrawer: room.currentDrawer,
      currentWord: currentPlayer.id === room.currentDrawer?.id ? room.currentWord : '',
      isRoundStarted: room.isRoundStarted,
      roundTime: room.settings.roundTime,
      currentRound: room.currentRound,
      maxRounds: room.settings.maxRounds,
      isSelectingWord: room.isSelectingWord,
      roundStartTimestamp: room.roundStartTimestamp,
      scores: Object.fromEntries(room.scores)
    };

    io.to(roomCode).emit('gameStateUpdate', gameState);
  });

  socket.on('startGame', ({ roomCode }, callback) => {
    try {
      if (!currentPlayer?.isHost) {
        return callback(new Error('Not authorized to start game'));
      }

      const room = roomManager.getRoom(roomCode);
      if (!room) {
        return callback(new Error('Room not found'));
      }

      const roundInfo = roomManager.startRound(roomCode);
      
      if (roundInfo) {
        room.roundStartTimestamp = Date.now();

        io.to(roomCode).emit('roundStart', {
          drawer: roundInfo.drawer,
          word: roundInfo.word,
          roundTime: room.settings.roundTime,
          roundStartTimestamp: room.roundStartTimestamp,
          currentRound: roundInfo.currentRound,
          maxRounds: roundInfo.maxRounds
        });

        const roundTimeout = setTimeout(() => {
          const updatedRoom = roomManager.handleTimeUp(roomCode);
          if (updatedRoom) {
            io.to(roomCode).emit('roundEnd', {
              currentRound: updatedRoom.currentRound,
              maxRounds: updatedRoom.settings.maxRounds,
              correctGuessers: []
            });

            setTimeout(() => {
              if (updatedRoom.currentRound >= updatedRoom.settings.maxRounds) {
                const gameEndData = roomManager.endGame(roomCode);
                io.to(roomCode).emit('gameEnd', gameEndData);
              } else {
                const roundInfo = roomManager.startRound(roomCode);
                if (roundInfo) {
                  io.to(roomCode).emit('roundStart', {
                    drawer: roundInfo.drawer,
                    word: roundInfo.word,
                    roundTime: updatedRoom.settings.roundTime,
                    roundStartTimestamp: Date.now(),
                    currentRound: roundInfo.currentRound,
                    maxRounds: roundInfo.maxRounds
                  });

                  io.to(roomCode).emit('gameStateUpdate', {
                    players: updatedRoom.players,
                    currentDrawer: roundInfo.drawer,
                    isRoundStarted: true,
                    roundTime: updatedRoom.settings.roundTime,
                    currentRound: roundInfo.currentRound,
                    maxRounds: roundInfo.maxRounds,
                    isSelectingWord: false,
                    currentWord: roundInfo.word,
                    scores: Object.fromEntries(updatedRoom.scores),
                    roundStartTimestamp: Date.now()
                  });
                }
              }
            }, 3000);
          }
        }, room.settings.roundTime * 1000);

        return callback(null);
      } else {
        return callback(new Error('Failed to start round'));
      }
    } catch (error) {
      return callback(error);
    }
  });

  socket.on('selectWord', ({ roomCode, wordIndex }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || currentPlayer.id !== room.currentDrawer?.id) return;

    const roundInfo = roomManager.selectWord(roomCode, wordIndex);
    if (roundInfo) {
      io.to(roomCode).emit('roundStart', {
        drawer: room.currentDrawer,
        word: room.currentWord,
        roundTime: roundInfo.roundTime,
        roundStartTimestamp: Date.now(),
        currentRound: room.currentRound,
        maxRounds: room.settings.maxRounds
      });

      io.to(roomCode).emit('gameStateUpdate', {
        players: room.players,
        currentDrawer: room.currentDrawer,
        isRoundStarted: true,
        roundTime: roundInfo.roundTime,
        currentRound: room.currentRound,
        maxRounds: room.settings.maxRounds,
        isSelectingWord: false,
        currentWord: room.currentWord,
        scores: Object.fromEntries(room.scores),
        roundStartTimestamp: Date.now()
      });

      socket.emit('wordSelected', {
        word: roundInfo.word
      });
    }
  });

  socket.on('message', (data) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room || !room.isRoundStarted) return;
    if (currentPlayer?.id === room.currentDrawer?.id) return;

    const isCorrectGuess = data.content.toLowerCase() === room.currentWord.toLowerCase();
    
    const senderPlayer = room.players.find(p => p.id === currentPlayer.id);
    const playerName = senderPlayer ? senderPlayer.name : data.playerName;
    
    io.to(data.roomCode).emit('message', {
      ...data,
      playerName,
      isCorrectGuess,
      guessMessage: isCorrectGuess 
        ? `${playerName} jabha(tha) las9a` 
        : null
    });

    if (isCorrectGuess) {
      const updatedRoom = roomManager.handleCorrectGuess(data.roomCode, currentPlayer.id);
      
      if (updatedRoom && !updatedRoom.isRoundStarted) {
        io.to(data.roomCode).emit('roundEnd', {
          currentRound: updatedRoom.currentRound,
          maxRounds: updatedRoom.settings.maxRounds,
          correctGuessers: Array.from(updatedRoom.correctGuessers).map(id => ({
            name: updatedRoom.players.find(p => p.id === id)?.name,
            points: updatedRoom.scores.get(id)
          }))
        });

        setTimeout(() => {
          if (updatedRoom.currentRound >= updatedRoom.settings.maxRounds) {
            const gameEndData = roomManager.endGame(data.roomCode);
            io.to(data.roomCode).emit('gameEnd', gameEndData);
          } else {
            const roundInfo = roomManager.startRound(data.roomCode);
            if (roundInfo) {
              io.to(data.roomCode).emit('roundStart', {
                drawer: roundInfo.drawer,
                word: roundInfo.word,
                roundTime: updatedRoom.settings.roundTime,
                roundStartTimestamp: Date.now(),
                currentRound: roundInfo.currentRound,
                maxRounds: roundInfo.maxRounds
              });

              io.to(data.roomCode).emit('gameStateUpdate', {
                players: updatedRoom.players,
                currentDrawer: roundInfo.drawer,
                isRoundStarted: true,
                roundTime: updatedRoom.settings.roundTime,
                currentRound: roundInfo.currentRound,
                maxRounds: roundInfo.maxRounds,
                isSelectingWord: false,
                currentWord: roundInfo.word,
                scores: Object.fromEntries(updatedRoom.scores),
                roundStartTimestamp: Date.now()
              });
            }
          }
        }, 3000);
      }
    }
  });

  socket.on('timeUp', ({ roomCode }) => {
    const updatedRoom = roomManager.handleTimeUp(roomCode);
    
    if (updatedRoom) {
      io.to(roomCode).emit('roundEnd', {
        currentRound: updatedRoom.currentRound,
        maxRounds: updatedRoom.settings.maxRounds,
        correctGuessers: []
      });

      setTimeout(() => {
        if (updatedRoom.currentRound >= updatedRoom.settings.maxRounds) {
          const gameEndData = roomManager.endGame(roomCode);
          io.to(roomCode).emit('gameEnd', gameEndData);
        } else {
          const roundInfo = roomManager.startRound(roomCode);
          if (roundInfo) {
            io.to(roomCode).emit('roundStart', {
              drawer: roundInfo.drawer,
              word: roundInfo.word,
              roundTime: updatedRoom.settings.roundTime,
              roundStartTimestamp: Date.now(),
              currentRound: roundInfo.currentRound,
              maxRounds: roundInfo.maxRounds
            });

            io.to(roomCode).emit('gameStateUpdate', {
              players: updatedRoom.players,
              currentDrawer: roundInfo.drawer,
              isRoundStarted: true,
              roundTime: updatedRoom.settings.roundTime,
              currentRound: roundInfo.currentRound,
              maxRounds: roundInfo.maxRounds,
              isSelectingWord: false,
              currentWord: roundInfo.word,
              scores: Object.fromEntries(updatedRoom.scores),
              roundStartTimestamp: Date.now()
            });
          }
        }
      }, 3000);
    }
  });

  socket.on('draw', (data) => {
    socket.to(data.roomCode).emit('draw', data);
  });

  socket.on('clearCanvas', (roomCode) => {
    socket.to(roomCode).emit('clearCanvas');
  });

  socket.on('leaveRoom', ({ roomCode }) => {
    if (!currentRoom || !currentPlayer) return;

    const updatedRoom = roomManager.leaveRoom(roomCode, currentPlayer.id);
    if (updatedRoom) {
      socket.leave(roomCode);
      io.to(roomCode).emit('gameStateUpdate', {
        players: updatedRoom.players,
        currentDrawer: updatedRoom.currentDrawer,
        isRoundStarted: updatedRoom.isRoundStarted,
        roundTime: updatedRoom.settings.roundTime,
        currentRound: updatedRoom.currentRound,
        maxRounds: updatedRoom.settings.maxRounds,
        isSelectingWord: updatedRoom.isSelectingWord,
        scores: Object.fromEntries(updatedRoom.scores)
      });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && currentPlayer) {
      const updatedRoom = roomManager.leaveRoom(currentRoom, currentPlayer.id);
      if (updatedRoom) {
        io.to(currentRoom).emit('gameStateUpdate', {
          players: updatedRoom.players,
          currentDrawer: updatedRoom.currentDrawer,
          isRoundStarted: updatedRoom.isRoundStarted,
          roundTime: updatedRoom.settings.roundTime,
          currentRound: updatedRoom.currentRound,
          maxRounds: updatedRoom.settings.maxRounds,
          isSelectingWord: updatedRoom.isSelectingWord,
          scores: Object.fromEntries(updatedRoom.scores)
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));