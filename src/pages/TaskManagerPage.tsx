import { useState, useEffect } from 'react';
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
  });

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const addTask = async (name: string) => {
    try {
      const response = await api.post('/tasks', { name });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
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
