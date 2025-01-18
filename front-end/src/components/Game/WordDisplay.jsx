import React from 'react';
import { Pencil } from 'lucide-react';

const WordDisplay = ({ word = '', isDrawer, isRoundStarted }) => {
  console.log('WordDisplay Props:', {
    word, 
    isDrawer, 
    isRoundStarted, 
    wordLength: word.length
  });

  const getMaskedWord = (word) => {
    if (!word) return '';
    return word.split('').map(char => char === ' ' ? '   ' : ' _ ').join('');
  };

  console.log('WordDisplay Props:', { word, isDrawer, isRoundStarted });

  if (!isRoundStarted) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500 text-lg">
          {word ? 'Preparig next round...' : 'ilti7a9 la3ibin hh...'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
      {isDrawer ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Pencil className="w-5 h-5" />
            <span className="font-medium">Khsk trsm :</span>
          </div>
          <p className="text-2xl font-bold tracking-wider">{word}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600 font-medium">Guess the word:</p>
          <p className="text-3xl font-mono tracking-wider">{getMaskedWord(word)}</p>
          <p className="text-sm text-gray-500 mt-2">
            {word.length} letters
          </p>
        </div>
      )}
    </div>
  );
};

export default WordDisplay;