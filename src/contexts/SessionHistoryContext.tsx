import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SessionRecord {
  type: 'focus' | 'break';
  duration: number;
  overTime?: number;
}

interface SessionHistoryContextType {
  sessionHistory: SessionRecord[];
  addSessionRecord: (type: 'focus' | 'break', duration: number, overTime?: number) => void;
  resetSessionHistory: () => void;
}

const SessionHistoryContext = createContext<SessionHistoryContextType | undefined>(undefined);

export const useSessionHistory = (): SessionHistoryContextType => {
  const context = useContext(SessionHistoryContext);
  if (!context) {
    throw new Error('useSessionHistory must be used within a SessionHistoryProvider');
  }
  return context;
};

interface SessionHistoryProviderProps {
  children: ReactNode;
}

export const SessionHistoryProvider: React.FC<SessionHistoryProviderProps> = ({ children }) => {
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);

  const addSessionRecord = (type: 'focus' | 'break', duration: number, overTime: number = 0) => {
    setSessionHistory((prev) => [
      ...prev,
      { type, duration, overTime: overTime > 0 ? overTime : undefined },
    ]);
  };

  const resetSessionHistory = () => {
    setSessionHistory([]);
  };

  return (
    <SessionHistoryContext.Provider value={{ sessionHistory, addSessionRecord, resetSessionHistory }}>
      {children}
    </SessionHistoryContext.Provider>
  );
};
