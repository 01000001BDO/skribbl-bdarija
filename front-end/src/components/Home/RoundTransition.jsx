import React from 'react';
import { useGame } from '../../contexts/GameContext';
import GameEnd from '../Game/GameEnd';

const RoundTransition = () => {
  const { gameState } = useGame();
  const { roundEndData, maxRounds, gameEnded } = gameState;
  
  const isLastRoundCompleted = roundEndData && roundEndData.currentRound >= maxRounds;
  
  if (gameEnded) {
    return <GameEnd />;
  }

  if (!isLastRoundCompleted) return null;

  return null;
};

export default RoundTransition;