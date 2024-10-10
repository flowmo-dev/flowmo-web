import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import Timer from '../components/Timer';
import TaskList from '../components/TaskList';

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
  const [selectedTask, setSelectedTask] = useState('');
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
  }, []);

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
      setIsRunning(true);
    } else if (isRunning && !isBreak) {
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Flowmodoro Timer</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <Timer time={time} isBreak={isBreak} breakTime={breakTime} />
          <button
            onClick={handleStartStop}
            className={`mt-4 px-4 py-2 rounded ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
        </div>
        <div className="w-full md:w-1/2">
          <TaskList onSelectTask={setSelectedTask} selectedTask={selectedTask} tasks={tasks} />
        </div>
      </div>
    </div>
  );
}

export default TimerPage;