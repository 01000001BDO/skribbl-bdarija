import React, { useState, useEffect } from 'react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import { MessagesSquare, Github } from 'lucide-react';

const Home = () => {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [buttonColor, setButtonColor] = useState('bg-red-500');
  const [buttonText, setButtonText] = useState("Don't Click Me");
  const [earthquake, setEarthquake] = useState(false);

  const getInitialButtonPosition = () => {
    const joinRoomElement = document.querySelector('.join-room-btn');
    if (joinRoomElement) {
      const rect = joinRoomElement.getBoundingClientRect();
      return { x: rect.left, y: rect.bottom + 10 };
    }
    return { x: 0, y: 0 };
  };

  useEffect(() => {
    setButtonPosition(getInitialButtonPosition());
  }, []);

  const moveButton = () => {
    if (!initialPosition) {
      setInitialPosition(buttonPosition);
    }

    setIsMoving(true);
    setButtonColor(randomColor());
    setButtonText('fik zmla ok hh');
    setEarthquake(true);
  };

  const resetPosition = () => {
    if (initialPosition) {
      setButtonPosition(initialPosition);
      setIsMoving(false);
      setButtonColor('bg-red-500');
      setButtonText("Don't Click Me");
      setEarthquake(false);
    }
  };

  const randomColor = () => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  useEffect(() => {
    let speed = 1000; 

    if (isMoving) {
      const handleMouseMove = (event) => {
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 50;

        const offsetX = Math.random() * 20 - 10;
        const offsetY = Math.random() * 20 - 10;

        const newX = Math.min(Math.max(event.clientX - 50 + offsetX, 0), maxX);
        const newY = Math.min(Math.max(event.clientY - 25 + offsetY, 0), maxY);

        setButtonPosition({
          x: newX,
          y: newY,
        });
        speed += 1;
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isMoving]);

  return (
    <>
      <div className={`min-h-screen bg-gray-50 py-12 px-4 ${earthquake ? 'earthquake' : ''}`}>
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
              <JoinRoom className="join-room-btn" />
            </div>
            <div
              style={{
                position: 'absolute',
                left: buttonPosition.x,
                top: buttonPosition.y,
                transition: 'top 0.1s, left 0.1s',
              }}
            >
              <button
                onClick={isMoving ? resetPosition : moveButton}
                className={`text-white px-6 py-3 rounded-lg shadow-md transition-all ${buttonColor}`}
              >
                {buttonText}
              </button>
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
          <span>
            Made by:{' '}
            <a
              href="https://github.com/01000001BDO/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600"
            >
              @aka_bousta
            </a>
          </span>
        </div>
      </footer>
    </>
  );
};

export default Home;
