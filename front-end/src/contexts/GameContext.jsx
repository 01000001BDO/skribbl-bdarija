import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(() => {
    const savedGameState = localStorage.getItem('skribblGameState');
    return savedGameState 
      ? JSON.parse(savedGameState) 
      : {
          players: [],
          currentDrawer: null,
          currentWord: '',
          isRoundStarted: false,
          roundTime: 80,
          isSelectingWord: false,
          gameEnded: false,
          winner: null,
          currentRound: 0,
          maxRounds: 3,
          roundEndData: null,
          scores: {},
          roundStartTimestamp: null
        };
  });

  useEffect(() => {
    localStorage.setItem('skribblGameState', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const createSocket = () => {
      const newSocket = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        forceNew: true
      });

      newSocket.on('connect', () => {
        setSocket(newSocket);
      });

      newSocket.on('gameStateUpdate', (newState) => {
        setGameState(prevState => {
          const mergedScores = { 
            ...prevState.scores, 
            ...newState.scores 
          };

          return { 
            ...prevState, 
            ...newState, 
            scores: mergedScores 
          };
        });
      });

      newSocket.on('roundStart', ({ 
        drawer, 
        word, 
        roundTime, 
        roundStartTimestamp, 
        currentRound, 
        maxRounds 
      }) => {
        setGameState((prevState) => ({
          ...prevState,
          currentDrawer: drawer,
          currentWord: word,
          isRoundStarted: true,
          roundTime,
          roundStartTimestamp,
          currentRound,
          maxRounds,
          isSelectingWord: false
        }));
      });

      newSocket.on('gameEnd', (gameEndData) => {
        console.log('Game End Raw Data:', gameEndData);
        
        setGameState(prevState => ({
          ...prevState,
          gameEnded: true,
          winner: gameEndData.winner,
          players: gameEndData.players,
          scores: gameEndData.scores || {}
        }));
      });

      return newSocket;
    };

    const socketInstance = createSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const resetGameState = () => {
    setGameState({
      players: [],
      currentDrawer: null,
      currentWord: '',
      isRoundStarted: false,
      roundTime: 80,
      isSelectingWord: false,
      gameEnded: false,
      winner: null,
      currentRound: 0,
      maxRounds: 3,
      roundEndData: null,
      scores: {},
      roundStartTimestamp: null
    });
    localStorage.removeItem('skribblGameState');
  };

  return (
    <GameContext.Provider value={{ 
      gameState, 
      setGameState, 
      socket, 
      resetGameState 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;