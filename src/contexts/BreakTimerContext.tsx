import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BreakTimerContextType {
  timeLeft: number;
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
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [showBreakEndModal, setShowBreakEndModal] = useState(false);

  const startBreak = (duration: number) => {
    setTimeLeft(duration);
    setIsBreakRunning(true);
    setShowBreakEndModal(false); // Hide modal when starting a new break
  };

  const stopBreak = () => {
    setIsBreakRunning(false);
    setShowBreakEndModal(true); // Show modal when break ends
  };

  return (
    <BreakTimerContext.Provider
      value={{
        timeLeft,
        isBreakRunning,
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
