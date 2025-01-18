import React from 'react';
import { Crown, Pencil } from 'lucide-react';

const PlayersList = ({ players = [], currentDrawer }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaderboard</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              player.id === currentDrawer?.id 
                ? 'bg-blue-50 border border-blue-100'
                : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`
                w-6 h-6 flex items-center justify-center rounded-full
                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-500'}
              `}>
                {index + 1}
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-800">
                  {player.name}
                </span>
                {player.isHost && (
                  <Crown size={16} className="text-yellow-500" />
                )}
                {player.id === currentDrawer?.id && (
                  <Pencil size={16} className="text-blue-500" />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-800">
                {player.score}
              </span>
              <span className="text-sm text-gray-500">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersList;