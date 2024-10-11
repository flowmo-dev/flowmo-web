import React, { createContext, useContext, ReactNode } from 'react';
import { useStopwatch } from 'react-timer-hook';

interface FocusStopwatchContextProps {
  elapsedTime: number;
  isFocusRunning: boolean;
  startFocus: () => void;
  stopFocus: () => void;
  resetFocus: () => void;
}

const FocusStopwatchContext = createContext<FocusStopwatchContextProps | undefined>(undefined);

export const FocusStopwatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    totalSeconds: elapsedTime,
    isRunning: isFocusRunning,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });

  const startFocus = () => {
    start();
  };

  const stopFocus = () => {
    pause();
  };

  const resetFocus = () => {
    console.log('Resetting focus timer');
    reset(undefined, false);
  };

  return (
    <FocusStopwatchContext.Provider value={{ elapsedTime, isFocusRunning, startFocus, stopFocus, resetFocus }}>
      {children}
    </FocusStopwatchContext.Provider>
  );
};

export const useFocusStopwatch = (): FocusStopwatchContextProps => {
  const context = useContext(FocusStopwatchContext);
  if (!context) {
    throw new Error('useFocusStopwatch must be used within a FocusStopwatchProvider');
  }
  return context;
};
