import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    playerName: '',
    roomCode: ''
  });
  const [error, setError] = useState('');

  const handleJoinRoom = async () => {
    if (!formData.playerName.trim() || !formData.roomCode.trim()) {
      setError('Please enter both your name and room code');
      return;
    }
   
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${formData.roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: formData.playerName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join room');
        return;
      }
      const { roomCode, playerId, player } = await response.json();
      localStorage.setItem(`playerId_${roomCode}`, playerId);
     
      navigate(`/room/${roomCode}`, {
        state: {
          roomCode,
          playerId,
          playerName: player.name
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={formData.playerName}
        onChange={e => setFormData(prev => ({ ...prev, playerName: e.target.value }))}
        placeholder="Enter your name"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={formData.roomCode}
        onChange={e => setFormData(prev => ({ ...prev, roomCode: e.target.value.toUpperCase() }))}
        placeholder="Enter room code"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      <button
        onClick={handleJoinRoom}
        disabled={!formData.playerName.trim() || !formData.roomCode.trim()}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
      >
        Join Room
      </button>
    </div>
  );
};

export default JoinRoom;