const { getRandomWord } = require('./words');

class RoomManager {
 constructor() {
   this.rooms = new Map();
   this.roundTimeouts = new Map();
 }

 generateRoomCode() {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   let code;
   do {
     code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
   } while (this.rooms.has(code));
   return code;
 }

 getWordChoices() {
   const words = new Set();
   while (words.size < 3) {
     words.add(getRandomWord());
   }
   return Array.from(words);
 }

 createRoom(hostPlayer, settings = {}) {
   const roomCode = this.generateRoomCode();
   const roomData = {
     players: [hostPlayer],
     currentDrawer: null,
     currentWord: '',
     isRoundStarted: false,
     host: hostPlayer.id,
     settings: {
       maxRounds: settings.maxRounds || 3,
       roundTime: settings.roundTime || 80
     },
     currentRound: 0,
     roundStartTime: null,
     gameState: 'waiting',
     correctGuessers: new Set(),
     scores: new Map(),
     wordChoices: null,
     isSelectingWord: false
   };

   roomData.scores.set(hostPlayer.id, 0);
   this.rooms.set(roomCode, roomData);
   return roomCode;
 }

 joinRoom(roomCode, player) {
   const room = this.rooms.get(roomCode);
   if (!room) return null;

   const existingPlayerNames = room.players.map(p => p.name);
   let uniqueName = player.name;
   let counter = 1;
   while (existingPlayerNames.includes(uniqueName)) {
     uniqueName = `${player.name}_${counter}`;
     counter++;
   }
   player.name = uniqueName;

   room.players.push(player);
   room.scores.set(player.id, 0);
   return room;
 }

 startRound(roomCode) {
  const room = this.rooms.get(roomCode);
  if (!room || room.isRoundStarted || room.players.length < 2) return null;

  // Increment round only if not already at max rounds
  if (room.currentRound < room.settings.maxRounds) {
    room.currentRound += 1;
  }

  const availablePlayers = room.currentDrawer
    ? room.players.filter(p => p.id !== room.currentDrawer.id)
    : room.players;
  
  const randomDrawer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

  const wordChoices = this.getWordChoices();

  room.currentDrawer = randomDrawer;
  room.wordChoices = wordChoices;
  room.isSelectingWord = true;
  room.gameState = 'playing';
  const selectedIndex = Math.floor(Math.random() * wordChoices.length);
  const selectedWord = wordChoices[selectedIndex];

  room.currentWord = selectedWord;
  room.isSelectingWord = false;
  room.isRoundStarted = true;
  room.roundStartTime = Date.now();
  room.correctGuessers = new Set();
  room.wordChoices = null;

  return {
    drawer: randomDrawer,
    wordChoices,
    currentRound: room.currentRound,
    maxRounds: room.settings.maxRounds,
    word: selectedWord
  };
}

 selectWord(roomCode, wordIndex = null) {
   const room = this.rooms.get(roomCode);
   if (!room || !room.wordChoices || !room.isSelectingWord) return null;

   const selectedIndex = wordIndex !== null 
     ? wordIndex 
     : Math.floor(Math.random() * room.wordChoices.length);

   const selectedWord = room.wordChoices[selectedIndex];
   if (!selectedWord) return null;

   room.currentWord = selectedWord;
   room.isSelectingWord = false;
   room.isRoundStarted = true;
   room.roundStartTime = Date.now();
   room.correctGuessers.clear();
   room.wordChoices = null;

   if (this.roundTimeouts.has(roomCode)) {
     clearTimeout(this.roundTimeouts.get(roomCode));
   }

   this.roundTimeouts.set(
     roomCode,
     setTimeout(() => {
       this.handleTimeUp(roomCode);
     }, room.settings.roundTime * 1000)
   );

   return {
     word: selectedWord,
     roundTime: room.settings.roundTime
   };
 }

 handleCorrectGuess(roomCode, playerId) {
   const room = this.rooms.get(roomCode);
   if (!room || !room.isRoundStarted) return null;

   if (room.correctGuessers.has(playerId) || playerId === room.currentDrawer.id) {
     return room;
   }

   room.correctGuessers.add(playerId);

   const nonDrawingPlayers = room.players.length - 1;
   const halfPlayers = Math.ceil(nonDrawingPlayers / 2);

   if (room.correctGuessers.size >= halfPlayers) {
     return this.endRoundAndPrepareNext(roomCode);
   }

   return room;
 }

 endRoundAndPrepareNext(roomCode, drawerLeft = false) {
   const room = this.rooms.get(roomCode);
   if (!room) return null;

   if (this.roundTimeouts.has(roomCode)) {
     clearTimeout(this.roundTimeouts.get(roomCode));
     this.roundTimeouts.delete(roomCode);
   }

   const nonDrawingPlayers = room.players.length - 1;
   const correctRatio = room.correctGuessers.size / nonDrawingPlayers;

   room.correctGuessers.forEach(playerId => {
     if (playerId !== room.currentDrawer.id) {
       const timeTaken = (Date.now() - room.roundStartTime) / 1000;
       const timeBonus = Math.max(0, Math.floor((room.settings.roundTime - timeTaken) * 2));
       const points = 50 + timeBonus;

       const currentScore = room.scores.get(playerId) || 0;
       room.scores.set(playerId, currentScore + points);
     }
   });

   if (!drawerLeft && room.currentDrawer) {
     const drawerPoints = Math.floor(correctRatio * 150);
     const currentScore = room.scores.get(room.currentDrawer.id) || 0;
     room.scores.set(room.currentDrawer.id, currentScore + drawerPoints);
   }

   room.players = room.players.map(player => ({
     ...player,
     score: room.scores.get(player.id) || 0
   }));

   room.isRoundStarted = false;
   room.currentWord = '';
   room.currentDrawer = null;
   room.correctGuessers.clear();
   room.roundStartTime = null;
   room.isSelectingWord = false;
   room.wordChoices = null;

   return room;
 }

 handleTimeUp(roomCode) {
  const room = this.rooms.get(roomCode);
  if (!room || !room.isRoundStarted) return null;
  room.players.forEach(player => {
    if (player.id !== room.currentDrawer.id) {
      const currentScore = room.scores.get(player.id) || 0;
      room.scores.set(player.id, Math.max(0, currentScore - 25));
    }
  });

  return this.endRoundAndPrepareNext(roomCode);
}

 endGame(roomCode) {
  const room = this.rooms.get(roomCode);
  if (!room) return null;
  const finalScores = {};
  room.players.forEach(player => {
    finalScores[player.id] = room.scores.get(player.id) || 0;
  });

  const sortedPlayers = [...room.players].sort((a, b) => 
    (finalScores[b.id] || 0) - (finalScores[a.id] || 0)
  );

  const actualWinner = sortedPlayers[0];

  return {
    gameEnded: true,
    winner: actualWinner,
    players: sortedPlayers,
    scores: finalScores
  };
}

 leaveRoom(roomCode, playerId) {
   const room = this.rooms.get(roomCode);
   if (!room) return null;

   const playerIndex = room.players.findIndex(p => p.id === playerId);
   if (playerIndex === -1) return null;

   room.players.splice(playerIndex, 1);
   room.scores.delete(playerId);

   if (playerId === room.host && room.players.length > 0) {
     const newHost = room.players[0];
     room.host = newHost.id;
     newHost.isHost = true;
   }

   if (room.currentDrawer?.id === playerId) {
     this.endRoundAndPrepareNext(roomCode, true);
   }

   if (room.players.length === 0) {
     if (this.roundTimeouts.has(roomCode)) {
       clearTimeout(this.roundTimeouts.get(roomCode));
       this.roundTimeouts.delete(roomCode);
     }
     this.rooms.delete(roomCode);
     return null;
   }

   return room;
 }

 getRoom(roomCode) {
   if (!roomCode) return null;
   return this.rooms.get(roomCode);
 }
}

module.exports = new RoomManager();