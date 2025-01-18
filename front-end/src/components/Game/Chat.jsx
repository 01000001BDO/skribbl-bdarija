import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ socket, roomCode, playerName, isDrawer, currentWord }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      setMessages(prev => [...prev, data]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    socket.emit('message', {
      roomCode,
      playerName,
      content: inputMessage
    });

    setInputMessage('');
  };

  const renderMessage = (message) => {
    if (message.guessMessage) {
      return (
        <div className="bg-green-200 text-green-800 p-2 rounded-lg mb-2">
          {message.guessMessage}
        </div>
      );
    }

    if (message.isCorrectGuess && message.playerName !== playerName) {
      return (
        <div className="bg-gray-200 text-gray-500 p-2 rounded-lg mb-2 blur-sm">
          {message.content}
        </div>
      );
    }

    return (
      <div
        className={`p-2 rounded-lg mb-2 ${
          message.playerName === playerName
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <span className="font-medium">{message.playerName}:</span>{' '}
        <span>{message.content}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full">
      <div
        ref={messagesContainerRef}
        className="flex-grow overflow-y-auto mb-4 max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{
          overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
      >
        <div className="space-y-2">
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              {renderMessage(message)}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!isDrawer && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your guess"
            className="flex-grow p-2 border rounded-lg"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;