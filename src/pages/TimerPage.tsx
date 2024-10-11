import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardBody, CardHeader, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Play, Pause, RotateCcw, Coffee, StopCircle } from 'lucide-react';
import Timer from '../components/Timer';
import SessionHistory from '../components/SessionHistory';
import useApi from '../hooks/useApi';

interface Task {
  id: number;
  name: string;
}

interface FocusSession {
  taskId: number;
  duration: number;
  date: Date;
}

interface SessionRecord {
  type: 'focus' | 'break';
  duration: number;
  overTime?: number;
}

function TimerPage() {
  const [selectedTask, setSelectedTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showResumeConfirmation, setShowResumeConfirmation] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);

  const api = useApi();

  useEffect(() => {
    fetchTasks();
    loadTimerState();
  }, []);

  useEffect(() => {
    saveTimerState();
  }, [selectedTask, isRunning, time, isBreak, breakTime, sessionStartTime, sessionHistory]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (isRunning) {
        saveTimerState();
      }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [isRunning]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (isBreak && prevTime >= breakTime) {
            // Record break overtime
            const overTime = prevTime - breakTime + 1;
            setSessionHistory(prev => [
              ...prev.slice(0, -1),
              { ...prev[prev.length - 1], overTime }
            ]);
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isBreak, breakTime]);

  const handleStartPause = () => {
    if (!isRunning && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };

  const handleEndSession = useCallback(async () => {
    setIsRunning(false);
    try {
      await createFocusSession({
        taskId: tasks.find(t => t.name === selectedTask)?.id || 0,
        duration: sessionHistory.reduce((total, record) => total + record.duration, 0),
        date: sessionStartTime || new Date(),
      });
    } catch (error) {
      console.error('Error saving focus session:', error);
    }
    setTime(0);
    setSessionStartTime(null);
    setShowEndConfirmation(false);
    setSessionHistory([]);
  }, [tasks, selectedTask, sessionHistory, sessionStartTime]);

  const createFocusSession = async (focusSession: FocusSession) => {
    try {
      await api.post('/focus-sessions', focusSession);
    } catch (error) {
      console.error('Failed to save focus session:', error);
    }
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setIsBreak(false);
    setBreakTime(0);
    setSessionStartTime(null);
    setSessionHistory([]);
  };

  const handleBreak = () => {
    const calculatedBreakTime = Math.floor(time / 5);
    setSessionHistory(prev => [
      ...prev,
      { type: 'focus', duration: time }
    ]);
    setBreakTime(calculatedBreakTime);
    setTime(0);
    setIsBreak(true);
    setIsRunning(true);
  };

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task) {
      setSelectedTask(task.name);
    }
  };

  const saveTimerState = () => {
    const timerState = {
      selectedTask,
      isRunning,
      time,
      isBreak,
      breakTime,
      sessionStartTime,
      sessionHistory,
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  };

  const loadTimerState = () => {
    const savedState = localStorage.getItem('timerState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setSelectedTask(parsedState.selectedTask);
      setIsRunning(false);
      setTime(parsedState.time);
      setIsBreak(parsedState.isBreak);
      setBreakTime(parsedState.breakTime);
      setSessionStartTime(parsedState.sessionStartTime ? new Date(parsedState.sessionStartTime) : null);
      setSessionHistory(parsedState.sessionHistory || []);
      
      if (parsedState.isRunning) {
        setShowResumeConfirmation(true);
      }
    }
  };

  const getSessionDuration = () => {
    if (!sessionStartTime) return 0;
    return Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
  };

  return (
    <>
      <Card className="max-w-md mx-auto mb-4">
        <CardHeader className="flex justify-center">
          <h2 className="text-2xl font-bold">Flowmodoro Timer</h2>
        </CardHeader>
        <CardBody>
          <Select 
            label="Select a task" 
            placeholder="Choose a task"
            className="mb-4"
            onChange={(e) => handleTaskSelect(e.target.value)}
            selectedKeys={[tasks.find(t => t.name === selectedTask)?.id.toString() || '']}
          >
            {tasks.map((task) => (
              <SelectItem key={task.id} value={task.id.toString()}>
                {task.name}
              </SelectItem>
            ))}
          </Select>
          <Timer time={time} isBreak={isBreak} breakTime={breakTime} />
          {sessionStartTime && (
            <p className="text-center mt-2">
              Session Duration: {Math.floor(getSessionDuration() / 60)}:{(getSessionDuration() % 60).toString().padStart(2, '0')}
            </p>
          )}
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              onClick={handleStartPause}
              color={isRunning ? "warning" : "success"}
              isDisabled={!selectedTask}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
            </Button>
            <Button
              onClick={handleReset}
              color="danger"
            >
              <RotateCcw size={24} />
            </Button>
            <Button
              onClick={handleBreak}
              color="primary"
              isDisabled={isBreak || time === 0}
            >
              <Coffee size={24} />
            </Button>
            <Button
              onClick={() => setShowEndConfirmation(true)}
              color="secondary"
              isDisabled={!sessionStartTime}
            >
              <StopCircle size={24} />
            </Button>
          </div>
          {isBreak && (
            <p className="text-center mt-4 text-blue-600 font-semibold">
              Break time! Relax for {Math.floor(breakTime / 60)}:{(breakTime % 60).toString().padStart(2, '0')}
            </p>
          )}
        </CardBody>
      </Card>

      <SessionHistory history={sessionHistory} />

      <Modal isOpen={showEndConfirmation} onClose={() => setShowEndConfirmation(false)}>
        <ModalContent>
          <ModalHeader>End Session</ModalHeader>
          <ModalBody>
            Are you sure you want to end the current session?
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleEndSession}>End Session</Button>
            <Button color="primary" onClick={() => setShowEndConfirmation(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showResumeConfirmation} onClose={() => setShowResumeConfirmation(false)}>
        <ModalContent>
          <ModalHeader>Resume Session</ModalHeader>
          <ModalBody>
            Do you want to resume the previous session?
          </ModalBody>
          <ModalFooter>
            <Button color="success" onClick={() => { setIsRunning(true); setShowResumeConfirmation(false); }}>Resume</Button>
            <Button color="danger" onClick={() => { handleReset(); setShowResumeConfirmation(false); }}>Start New</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default TimerPage;