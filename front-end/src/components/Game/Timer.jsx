import React, { useState, useEffect, useRef } from 'react';

const Timer = ({ duration, roundStartTimestamp, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const updateTimer = () => {
      const elapsedTime = Math.floor((Date.now() - roundStartTimestamp) / 1000);
      const remaining = Math.max(0, duration - elapsedTime);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        cancelAnimationFrame(animationFrameRef.current);
        onTimeUp();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [duration, roundStartTimestamp, onTimeUp]);

  const progressPercentage = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="relative w-full max-w-xs">
      <div 
        className="h-2 bg-blue-200 rounded-full overflow-hidden"
        style={{ width: '100%' }}
      >
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-100"
          style={{ 
            width: `${progressPercentage}%`,
            transformOrigin: 'left center'
          }}
        />
      </div>
      <div className="text-center mt-2 text-sm font-bold">
        {timeLeft} lib9at ahbibi
      </div>
    </div>
  );
};

export default Timer;