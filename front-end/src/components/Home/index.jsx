import React from 'react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import { MessagesSquare, Github } from 'lucide-react';

const Home = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Skribbl Bdarija
            </h1>
            <p className="text-gray-600">
              Draw and guess words in Moroccan Darija!
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Create New Room
              </h2>
              <CreateRoom />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Join Room
              </h2>
              <JoinRoom />
            </div>
          </div>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container mx-auto max-w-md flex justify-center space-x-8">
          <a
            href="https://discord.gg/EJeUgCTH3d"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <MessagesSquare className="w-5 h-5" />
            <span>Join Discord</span>
          </a>
          <a
            href="https://github.com/01000001BDO/skribbl-bdarija.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Github className="w-5 h-5" />
            <span>Contribute</span>
          </a>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <span>Made by: <a href="https://github.com/01000001BDO/"  target="_blank"  rel="noopener noreferrer" className="text-indigo-600">@aka_bousta</a></span>
        </div>
      </footer>
    </>
  );
};

export default Home;
