import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    playerName: '',
    maxRounds: 3,
    roundTime: 80
  });
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!formData.playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      console.log('Creating room with data:', formData);
      
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerName: formData.playerName,
          settings: {
            maxRounds: parseInt(formData.maxRounds),
            roundTime: parseInt(formData.roundTime)
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to create room');
      }

      const data = await response.json();
      console.log('Room created successfully:', data);
      localStorage.setItem(`playerId_${data.roomCode}`, data.playerId);
      navigate(`/room/${data.roomCode}`);
      
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
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

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <Settings size={18} />
        <span>Room Settings</span>
      </button>

      {showSettings && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Number of Rounds</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.maxRounds}
              onChange={e => setFormData(prev => ({ ...prev, maxRounds: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Time per Round (seconds)</label>
            <input
              type="number"
              min="30"
              max="180"
              step="10"
              value={formData.roundTime}
              onChange={e => setFormData(prev => ({ ...prev, roundTime: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        onClick={handleCreateRoom}
        disabled={!formData.playerName.trim()}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
      >
        Create Room
      </button>
    </div>
  );
};

export default CreateRoom;