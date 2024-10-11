import React, { useState, useEffect } from 'react';
import TaskManager from '../components/TaskManager';
import useApi from '../hooks/useApi';

interface Task {
  id: string;
  name: string;
}

function TaskManagerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const api = useApi();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    }
  };

  const addTask = async (name: string) => {
    try {
      const response = await api.post('/tasks', { name });
      setTasks(prevTasks => [...prevTasks, response.data]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="h-full">
      <TaskManager tasks={tasks} addTask={addTask} deleteTask={deleteTask} />
    </div>
  );
}

export default TaskManagerPage;