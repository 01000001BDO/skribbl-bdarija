import React from 'react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Skribbl Bdarija
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
            <CreateRoom />
          </div>
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Join Room</h2>
            <JoinRoom />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;