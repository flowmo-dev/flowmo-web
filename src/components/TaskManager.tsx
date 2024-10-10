import React, { useState } from 'react';
import { Input, Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  name: string;
}

interface TaskManagerProps {
  tasks: Task[];
  addTask: (name: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, addTask, deleteTask }) => {
  const [newTaskName, setNewTaskName] = useState('');

  const handleAddTask = async () => {
    if (newTaskName.trim()) {
      await addTask(newTaskName.trim());
      setNewTaskName('');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Task Manager</h2>
      </CardHeader>
      <CardBody>
        <div className="flex mb-4">
          <Input
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Add a new task"
            className="flex-grow"
          />
          <Button
            onClick={handleAddTask}
            color="primary"
          >
            <Plus size={20} />
          </Button>
        </div>
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <span>{task.name}</span>
              <Button
                onClick={() => handleDeleteTask(task.id)}
                color="danger"
                size="sm"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default TaskManager;