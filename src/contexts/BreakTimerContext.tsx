import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTimer } from 'react-timer-hook';

interface BreakTimerContextProps {
  timeLeft: number;
  isBreakRunning: boolean;
  startBreak: (durationInSeconds: number) => void;
  stopBreak: () => void;
  resetBreak: () => void;
  overTime: number;
}

const BreakTimerContext = createContext<BreakTimerContextProps | undefined>(undefined);

export const BreakTimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [overTime, setOverTime] = useState(0);
  const [isOverTime, setIsOverTime] = useState(false);

  const {
    seconds: timeLeft,
    isRunning: isBreakRunning,
    start,
    pause,
    restart,
  } = useTimer({
    expiryTimestamp: new Date(),
    autoStart: false,
    onExpire: () => {
      setIsOverTime(true);
      setOverTime(0);
    },
  });

  const startBreak = (durationInSeconds: number) => {
    console.log('startBreak called with durationInSeconds:', durationInSeconds);
    const time = new Date();
    time.setSeconds(time.getSeconds() + durationInSeconds);
    restart(time, false);
    setOverTime(0);
    setIsOverTime(false);
  };

  const stopBreak = () => {
    pause();
  };

  const resetBreak = () => {
    pause();
    setOverTime(0);
    setIsOverTime(false);
  };

  if (isOverTime && isBreakRunning) {
    setTimeout(() => {
      setOverTime((prev) => prev + 1);
    }, 1000);
  }

  return (
    <BreakTimerContext.Provider value={{ timeLeft, isBreakRunning, startBreak, stopBreak, resetBreak, overTime }}>
      {children}
    </BreakTimerContext.Provider>
  );
};

export const useBreakTimer = (): BreakTimerContextProps => {
  const context = useContext(BreakTimerContext);
  if (!context) {
    throw new Error('useBreakTimer must be used within a BreakTimerProvider');
  }
  return context;
};
