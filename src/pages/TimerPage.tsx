import { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';

interface Task {
  id: string;
  name: string;
}

interface FocusSession {
  id: string;
  taskName: string;
  duration: number;
  date: string;
}

function TimerPage() {
  const [selectedTask, _setSelectedTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const api = useApi();

  useEffect(() => {
    fetchTasks();
    fetchFocusSessions();
  });

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchFocusSessions = async () => {
    try {
      const response = await api.get('/focus-sessions');
      setFocusSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch focus sessions:', error);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (isBreak && prevTime >= breakTime - 1) {
            clearInterval(interval);
            setIsRunning(false);
            setIsBreak(false);
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isBreak, breakTime]);

  const handleStartStop = async () => {
    if (!isRunning && !isBreak && selectedTask) {
      // Start a new focus session
      setIsRunning(true);
    } else if (isRunning && !isBreak) {
      // End the current focus session
      setIsRunning(false);
      try {
        const response = await api.post('/focus-sessions', {
          taskId: selectedTask,
          duration: time,
          date: new Date().toISOString(),
        });
        setFocusSessions([...focusSessions, response.data]);
      } catch (error) {
        console.error('Failed to save focus session:', error);
      }
    }
  };

  // ... rest of the component remains the same
}

export default TimerPage;
