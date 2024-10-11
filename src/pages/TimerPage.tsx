import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Select, SelectItem } from "@nextui-org/react";
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import Timer from '../components/Timer';
import useApi from '../hooks/useApi';

interface Task {
  id: number;
  name: string;
}

function TimerPage() {
  const [selectedTask, setSelectedTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);

  const api = useApi();

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
      // End the current session and save it
      setIsRunning(false);
      try {
        await createFocusSession({
          taskId: tasks.find(t => t.name === selectedTask)?.id || 0, // Workaround
          duration: time,
          date: new Date(),
        });
      } catch (error) {
        console.error('Error saving focus session:', error);
      }
    }
  };

  const createFocusSession = async (focusSession: { taskId: number; duration: number; date: Date }) => {
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
  };

  const handleBreak = () => {
    const calculatedBreakTime = Math.floor(time / 5);
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

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex justify-center">
        <h2 className="text-2xl font-bold">Flowmodoro Timer</h2>
      </CardHeader>
      <CardBody>
        <Select 
          label="Select a task" 
          placeholder="Choose a task"
          className="mb-4"
          onChange={(e) => handleTaskSelect(e.target.value)}
        >
          {tasks.map((task) => (
            <SelectItem key={task.id} value={task.id.toString()}>
              {task.name}
            </SelectItem>
          ))}
        </Select>
        {selectedTask && <p className="mb-4">Current task: {selectedTask}</p>}
        <Timer time={time} isBreak={isBreak} breakTime={breakTime} />
        <div className="flex justify-center space-x-4 mt-4">
          <Button
            onClick={handleStartStop}
            color={isRunning ? "danger" : "success"}
            isDisabled={!selectedTask && !isRunning}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </Button>
          <Button
            onClick={handleReset}
            color="warning"
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
        </div>
        {isBreak && (
          <p className="text-center mt-4 text-blue-600 font-semibold">
            Break time! Relax for {Math.floor(breakTime / 60)}:{(breakTime % 60).toString().padStart(2, '0')}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

export default TimerPage;
