import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import Canvas from './Canvas';
import Chat from './Chat';
import PlayersList from './PlayersList';
import Timer from './Timer';
import WordDisplay from './WordDisplay';
import GameEnd from './GameEnd';
import RoundTransition from '../Home/RoundTransition';
import { Copy, Check, Play, Users, LogOut } from 'lucide-react';

const Game = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { gameState, socket } = useGame();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const playerId = localStorage.getItem(`playerId_${roomCode}`);
    if (!playerId) {
      navigate('/');
      return;
    }

    socket.emit('joinRoom', { roomCode, playerId });

    const handlePlayerInfo = (info) => {
      setPlayerInfo(info);
    };

    const handleRoomNotFound = () => {
      navigate('/');
    };

    socket.on('playerInfo', handlePlayerInfo);
    socket.on('roomNotFound', handleRoomNotFound);

    return () => {
      socket.off('playerInfo', handlePlayerInfo);
      socket.off('roomNotFound', handleRoomNotFound);
      if (window.location.pathname !== `/room/${roomCode}`) {
        socket.emit('leaveRoom', { roomCode, playerId });
      }
    };
  }, [socket, roomCode, navigate]);

  const handleStartGame = () => {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }
  
    if (!socket.connected) {
      socket.connect();
    }
  
    socket.emit('startGame', { roomCode }, (error) => {
      if (error) {
        console.error('Error starting game:', error);
        console.log('Error details:', error instanceof Error ? error.message : error);
      } else {
        console.log('Game started successfully');
      }
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave the room?')) {
      localStorage.removeItem(`playerId_${roomCode}`);
      socket.emit('leaveRoom', { roomCode });
      navigate('/');
    }
  };

  const isDrawer = playerInfo?.id === gameState.currentDrawer?.id;
  const isHost = playerInfo?.isHost;
  const canStartGame = isHost && 
    !gameState.isRoundStarted && 
    !gameState.isSelectingWord && 
    gameState.players.length >= 2;

  return (
    <div className="min-h-screen bg-gray-50">
          {gameState.gameEnded && <GameEnd />}
          {gameState.roundEndData && !gameState.gameEnded && <RoundTransition />}
      
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
              Skribbl Bdarija
              </h1>
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Room:</span>
                <span className="font-mono font-semibold">{roomCode}</span>
                <button
                  onClick={copyRoomCode}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Leave Room</span>
              </button>

              {canStartGame && (
                <button
                  onClick={handleStartGame}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span className="hidden sm:inline">Start Game</span>
                </button>
              )}

              <button
                onClick={() => setShowMobileLeaderboard(!showMobileLeaderboard)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <Users className="w-6 h-6 text-gray-600" />
                {gameState.players.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {gameState.players.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMobileLeaderboard && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Players</h2>
              <button 
                onClick={() => setShowMobileLeaderboard(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <PlayersList 
                players={gameState.players} 
                currentDrawer={gameState.currentDrawer}
              />
            </div>
          </div>
        </div>
      )}

      <div className="pt-20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="hidden lg:block lg:col-span-3">
              <PlayersList 
                players={gameState.players} 
                currentDrawer={gameState.currentDrawer}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <WordDisplay 
                word={gameState.currentWord}
                isDrawer={isDrawer}
                isRoundStarted={gameState.isRoundStarted}
              />
              <div className="relative bg-white p-4 rounded-xl shadow-sm">
                <Canvas 
                  isDrawer={isDrawer}
                  socket={socket}
                  roomCode={roomCode}
                />
                {gameState.isRoundStarted && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                   <Timer 
                      duration={gameState.roundTime}
                      roundStartTimestamp={gameState.roundStartTimestamp}
                      onTimeUp={() => {
                        if (isDrawer) {
                          socket.emit('timeUp', { roomCode });
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <Chat 
                socket={socket}
                roomCode={roomCode}
                playerName={playerInfo?.name}
                isDrawer={isDrawer}
                currentWord={gameState.currentWord}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;