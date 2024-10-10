import React from 'react';

interface TimerProps {
  time: number;
  isBreak: boolean;
  breakTime: number;
}

const Timer: React.FC<TimerProps> = ({ time, isBreak, breakTime }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-bold mb-4">{formatTime(time)}</div>
      {isBreak && (
        <div className="text-blue-600">
          Break time remaining: {formatTime(time)}
        </div>
      )}
    </div>
  );
};

export default Timer;