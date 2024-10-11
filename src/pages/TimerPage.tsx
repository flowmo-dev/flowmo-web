import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Card, CardBody, CardHeader, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem
} from "@nextui-org/react";
import { Play, Pause, Coffee, StopCircle } from 'lucide-react';
import Timer from '../components/Timer';
import SessionHistory from '../components/SessionHistory';
import useApi from '../hooks/useApi';
import { useBreakTimer } from '../contexts/BreakTimerContext';
import { useFocusStopwatch } from '../contexts/FocusStopwatchContext';
import { useSessionHistory } from '../contexts/SessionHistoryContext'; // Import the new context

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

function TimerPage() {
  const [selectedTask, setSelectedTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  const api = useApi();

  const { timeLeft: breakTime, isBreakRunning, startBreak } = useBreakTimer();
  const { elapsedTime: focusTime, isFocusRunning, startFocus, stopFocus, resetFocus } = useFocusStopwatch();
  const { sessionHistory, addSessionRecord, resetSessionHistory } = useSessionHistory(); // Use the session history context

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id.toString() === taskId);
    if (task) {
      setSelectedTask(task.name);
    }
  };

  const handleStartPause = () => {
    if (!isFocusRunning) {
      setSessionStartTime(new Date());
      startFocus();
    } else {
      stopFocus();
    }
  };

  const handleBreak = () => {
    const calculatedBreakTime = Math.floor(focusTime / 5);
    addSessionRecord('focus', focusTime);
    resetFocus();
    startBreak(calculatedBreakTime);
  };

  const handleEndSession = useCallback(async () => {
    setShowEndConfirmation(false);
    resetFocus();
    stopFocus();
    const focusSession: FocusSession = {
      taskId: tasks.find(t => t.name === selectedTask)?.id || 0,
      duration: sessionHistory.reduce((total, record) => total + record.duration, 0),
      date: sessionStartTime || new Date(),
      records: sessionHistory,
    };
    await createFocusSession(focusSession);
    resetSession();
  }, [tasks, selectedTask, sessionHistory, sessionStartTime]);

  const createFocusSession = async (focusSession: FocusSession) => {
    try {
      await api.post('/focus-sessions', focusSession);
    } catch (error) {
      console.error('Failed to save focus session:', error);
    }
  };

  const resetSession = () => {
    setSessionStartTime(null);
    resetSessionHistory();
  };

  return (
    <>
      <Card className="max-w-md mx-auto mb-4">
        <CardHeader className="flex justify-center">
          <h3 className="text-xl font-bold">Timer</h3>
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
          <Timer time={isBreakRunning ? breakTime : focusTime} isBreak={isBreakRunning} />
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={handleStartPause} color={isFocusRunning ? "warning" : "success"} isDisabled={!selectedTask}>
              {isFocusRunning ? <Pause size={24} /> : <Play size={24} />}
            </Button>
            <Button onClick={handleBreak} color="primary" isDisabled={isBreakRunning || focusTime === 0}>
              <Coffee size={24} />
            </Button>
            <Button onClick={() => setShowEndConfirmation(true)} color="secondary" isDisabled={!sessionStartTime}>
              <StopCircle size={24} />
            </Button>
          </div>
          {isBreakRunning && breakTime > 0 && (
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
            Are you sure you want to end the current session? This will save your progress.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleEndSession}>End and Save</Button>
            <Button color="primary" onClick={() => setShowEndConfirmation(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default TimerPage;
