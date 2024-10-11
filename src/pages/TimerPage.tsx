import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Card, CardBody, CardHeader, Select, SelectItem, Modal,
  ModalContent, ModalHeader, ModalBody, ModalFooter
} from "@nextui-org/react";
import { Play, Pause, Coffee, StopCircle } from 'lucide-react';
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
  records: SessionRecord[];
}

interface SessionRecord {
  type: 'focus' | 'break';
  duration: number;
  overTime?: number;
}

const TIMER_INTERVAL = 1000;
const SAVE_INTERVAL = 10000;

function TimerPage() {
  const [selectedTask, setSelectedTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [overTime, setOverTime] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showResumeConfirmation, setShowResumeConfirmation] = useState(false);
  const [showOverTimeModal, setShowOverTimeModal] = useState(false);
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
    const saveInterval = setInterval(() => isRunning && saveTimerState(), SAVE_INTERVAL);
    return () => clearInterval(saveInterval);
  }, [isRunning]);

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = setInterval(updateTime, TIMER_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const updateTime = () => {
    setTime((prevTime) => {
      if (isBreak) {
        if (prevTime > 0) {
          // 休憩時間がまだ残っている場合、カウントダウン
          return prevTime - 1;
        } else {
          // 休憩時間が終了した場合、超過時間のカウントを開始
          setOverTime((prevOverTime) => prevOverTime + 1);
          if (!showOverTimeModal) {
            setShowOverTimeModal(true);
          }
          return 0;
        }
      } else {
        return prevTime + 1;
      }
    });
  };

  const handleStartPause = () => {
    if (!isRunning && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsRunning((prev) => !prev);
  };

  const handleEndSession = useCallback(async () => {
    setIsRunning(false);
    const focusSession: FocusSession = {
      taskId: tasks.find(t => t.name === selectedTask)?.id || 0,
      duration: sessionHistory.reduce((total, record) => total + record.duration, 0),
      date: sessionStartTime || new Date(),
      records: sessionHistory,
    };
    await createFocusSession(focusSession);
    resetSession();
    setShowEndConfirmation(false);
  }, [tasks, selectedTask, sessionHistory, sessionStartTime]);

  const createFocusSession = async (focusSession: FocusSession) => {
    try {
      await api.post('/focus-sessions', focusSession);
    } catch (error) {
      console.error('Failed to save focus session:', error);
    }
  };

  const handleBreak = () => {
    const calculatedBreakTime = Math.floor(time / 5);
    addSessionRecord('focus', time);
    setBreakTime(calculatedBreakTime);
    startBreak(calculatedBreakTime);
  };

  const handleBreakEnd = () => {
    addSessionRecord('break', breakTime, overTime);
    resetTime();
    setShowOverTimeModal(false);
  };

  const addSessionRecord = (type: 'focus' | 'break', duration: number, overTime: number = 0) => {
    setSessionHistory((prev) => [...prev, { type, duration, overTime: overTime > 0 ? overTime : undefined }]);
  };

  const startBreak = (calculatedBreakTime: number) => {
    setTime(calculatedBreakTime);
    setIsBreak(true);
    setIsRunning(true);
  };

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id.toString() === taskId);
    if (task) {
      setSelectedTask(task.name);
    }
  };

  const saveTimerState = () => {
    const timerState = {
      selectedTask, isRunning, time, isBreak, breakTime, sessionStartTime, sessionHistory
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  };

  const loadTimerState = () => {
    const savedState = JSON.parse(localStorage.getItem('timerState') || '{}');
    if (savedState) {
      setSelectedTask(savedState.selectedTask || '');
      setIsRunning(false);
      setTime(savedState.time || 0);
      setIsBreak(savedState.isBreak || false);
      setBreakTime(savedState.breakTime || 0);
      setSessionStartTime(savedState.sessionStartTime ? new Date(savedState.sessionStartTime) : null);
      setSessionHistory(savedState.sessionHistory || []);
      if (savedState.isRunning) {
        setShowResumeConfirmation(true);
      }
    }
  };

  const resetTime = () => {
    setTime(0);
    setIsBreak(false);
    setIsRunning(false);
    setOverTime(0);
  };

  const resetSession = () => {
    resetTime();
    setBreakTime(0);
    setSessionStartTime(null);
    setSessionHistory([]);
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
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={handleStartPause} color={isRunning ? "warning" : "success"} isDisabled={!selectedTask}>
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
            </Button>
            <Button onClick={handleBreak} color="primary" isDisabled={isBreak || time === 0}>
              <Coffee size={24} />
            </Button>
            <Button onClick={() => setShowEndConfirmation(true)} color="secondary" isDisabled={!sessionStartTime}>
              <StopCircle size={24} />
            </Button>
          </div>
          {isBreak && time > 0 && (
            <p className="text-center mt-4 text-blue-600 font-semibold">
              Break time! Relax for {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
            </p>
          )}
        </CardBody>
      </Card>

      <SessionHistory history={sessionHistory} />

      <Modal isOpen={showEndConfirmation} onClose={() => setShowEndConfirmation(false)}>
        <ModalContent>
          <ModalHeader>End Session</ModalHeader>
          <ModalBody>Are you sure you want to end the current session?</ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleEndSession}>End Session</Button>
            <Button color="primary" onClick={() => setShowEndConfirmation(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showResumeConfirmation} onClose={() => setShowResumeConfirmation(false)}>
        <ModalContent>
          <ModalHeader>Resume Session</ModalHeader>
          <ModalBody>Do you want to resume the previous session?</ModalBody>
          <ModalFooter>
            <Button color="success" onClick={() => { setIsRunning(true); setShowResumeConfirmation(false); }}>Resume</Button>
            <Button color="danger" onClick={() => { resetSession(); setShowResumeConfirmation(false); }}>Start New</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showOverTimeModal} onClose={() => setShowOverTimeModal(false)}>
        <ModalContent>
          <ModalHeader>Break Over</ModalHeader>
          <ModalBody>
            <p className="text-center text-red-600 text-3xl font-bold">
              Over Time: {Math.floor(overTime / 60)}:{(overTime % 60).toString().padStart(2, '0')}
            </p>
            <p>The break time has ended. Please wrap up.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleBreakEnd}>End Break</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default TimerPage;
