import React, { useState, useEffect } from 'react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import { MessagesSquare, Github } from 'lucide-react';

const Home = () => {
  const [buttonPosition, setButtonPosition] = useState({ 
    x: window.innerWidth - 100,
    y: window.innerHeight * 0.4
  });
  const [buttonColor, setButtonColor] = useState('bg-red-500');
  const [buttonText, setButtonText] = useState("Don't Click Me 😮");
  const [earthquake, setEarthquake] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [showNormalUI, setShowNormalUI] = useState(false);

  const getButtonPosition = (e) => {
    const buttonWidth = 150;
    const buttonHeight = 150;
    const footerHeight = 100;
    const padding = 20;
    
    const x = Math.min(Math.max(e.clientX - buttonWidth / 2, padding), window.innerWidth - buttonWidth - padding);
    const y = Math.min(Math.max(e.clientY - buttonHeight / 2, padding), window.innerHeight - footerHeight - buttonHeight);
    
    return { x, y };
  };

  const handleMouseMove = (e) => {
    if (buttonClicked && buttonVisible) {
      setButtonPosition(getButtonPosition(e));
      setButtonColor(randomColors[Math.floor(Math.random() * randomColors.length)]);
    }
  };

  const moveButton = () => {
    setButtonClicked(true);
    setEarthquake(true);
    setButtonText('fik zmla ok hh');
    setInputDisabled(true);
  };

  const handleFinalClick = () => {
    setButtonVisible(false);
    setEarthquake(false);
    alert('kay3fo 3Lik mn zemla hh');
    setShowNormalUI(true);
    setInputDisabled(false);
  };

  const handleButtonClick = () => {
    if (!buttonClicked) {
      moveButton();
    } else {
      handleFinalClick();
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    
    const handleResize = () => {
      if (!buttonClicked) {
        setButtonPosition({ 
          x: window.innerWidth - 100,
          y: window.innerHeight * 0.4
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [buttonClicked]);

  return (
    <>
      <div className={`min-h-screen bg-gray-50 py-12 px-4 ${earthquake ? 'earthquake' : ''}`}>
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Skribbl Bdarija</h1>
            <p className="text-gray-600">Draw and guess words in Moroccan Darija!</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
            <div style={{ visibility: showNormalUI || !inputDisabled ? 'visible' : 'hidden' }}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Room</h2>
              <CreateRoom disabled={inputDisabled} />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            <div style={{ visibility: showNormalUI || !inputDisabled ? 'visible' : 'hidden' }}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Join Room</h2>
              <JoinRoom disabled={inputDisabled} />
            </div>
          </div>
        </div>
      </div>

      {buttonVisible && (
        <div
          className="fixed animate-pulse"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            zIndex: 50,
          }}
        >
          <button
            onClick={handleButtonClick}
            className={`text-white px-6 py-3 rounded-lg shadow-lg transition-all ${buttonColor} 
              hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
              animate-wiggle`}
          >
            {buttonText}
          </button>
        </div>
      )}

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

      <style jsx global>{`
        @keyframes earthquake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .earthquake {
          animation: earthquake 0.5s infinite;
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

const randomColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];

export default Home;
