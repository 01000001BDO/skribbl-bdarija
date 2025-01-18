import React, { useEffect, useMemo } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';

const GameEnd = () => {
  const navigate = useNavigate();
  const { gameState, resetGameState } = useGame();
  const { winner, players, scores } = gameState;

  useEffect(() => {
    const timer = setTimeout(() => {
      resetGameState();
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, resetGameState]);

  const sortedPlayers = useMemo(() => {
    console.log('Raw Scores:', scores);
    console.log('Players:', players);

    return [...players].sort((a, b) => {
      const scoreA = scores[a.id] || 0;
      const scoreB = scores[b.id] || 0;
      console.log(`Comparing ${a.name}: ${scoreA} vs ${b.name}: ${scoreB}`);
      return scoreB - scoreA;
    });
  }, [players, scores]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
        <div className="text-center">
          <Trophy className="mx-auto w-24 h-24 text-yellow-500 animate-bounce" />
          <h2 className="text-3xl font-bold text-blue-600 mb-4">Game Salat ahbibi!</h2>
         
          <div className="mb-6">
            {winner && (
              <h3 className="text-2xl font-semibold">
                Winner: {winner.name}
              </h3>
            )}
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <h4 className="text-xl font-semibold mb-4">Final Standings</h4>
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex justify-between items-center p-2 rounded-lg mb-2 ${
                  index === 0 ? 'bg-yellow-100' :
                  index === 1 ? 'bg-gray-200' :
                  index === 2 ? 'bg-orange-100' : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {index === 0 && <Medal className="w-6 h-6 text-yellow-500" />}
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="font-bold">
                  {scores[player.id] || 0} pts
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-gray-600">
            Redirecting to homepage in a few seconds...
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEnd;