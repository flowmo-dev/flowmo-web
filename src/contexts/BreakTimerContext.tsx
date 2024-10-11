import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTimer } from 'react-timer-hook';

interface BreakTimerContextType {
  timeLeft: number;
  currentBreakDuration: number;
  isBreakRunning: boolean;
  startBreak: (duration: number) => void;
  stopBreak: () => void;
  showBreakEndModal: boolean;
  setShowBreakEndModal: (value: boolean) => void;
}

const BreakTimerContext = createContext<BreakTimerContextType | undefined>(undefined);

export const useBreakTimer = (): BreakTimerContextType => {
  const context = useContext(BreakTimerContext);
  if (!context) {
    throw new Error('useBreakTimer must be used within a BreakTimerProvider');
  }
  return context;
};

interface BreakTimerProviderProps {
  children: ReactNode;
}

export const BreakTimerProvider: React.FC<BreakTimerProviderProps> = ({ children }) => {
  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [showBreakEndModal, setShowBreakEndModal] = useState(false);
  const [expiryTimestamp, setExpiryTimestamp] = useState<Date | undefined>(undefined);
  
  const [currentBreakDuration, setCurrentBreakDuration] = useState<number>(0);

  const { totalSeconds, isRunning, pause, restart } = useTimer({
    expiryTimestamp: expiryTimestamp ?? new Date(), // Fallback to current date if undefined
    autoStart: false,
    onExpire: () => {
      setIsBreakRunning(false);
      stop();
      setShowBreakEndModal(true); // Show modal when the break ends
    },
  });

  const startBreak = (duration: number) => {
    setCurrentBreakDuration(duration);
    const time = new Date();
    time.setSeconds(time.getSeconds() + duration); // Set the expiration time
    setExpiryTimestamp(time);
    setIsBreakRunning(true);
    setShowBreakEndModal(false); // Hide modal when starting a new break
    restart(time); // Start the timer
  };

  const stopBreak = () => {
    setIsBreakRunning(false);
    pause(); // Pause the timer
  };

  return (
    <BreakTimerContext.Provider
      value={{
        timeLeft: totalSeconds,
        currentBreakDuration: currentBreakDuration,
        isBreakRunning: isBreakRunning && isRunning,
        startBreak,
        stopBreak,
        showBreakEndModal,
        setShowBreakEndModal,
      }}
    >
      {children}
    </BreakTimerContext.Provider>
  );
};
