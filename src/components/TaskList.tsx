import React, { useState } from 'react'
import { Plus } from 'lucide-react'

interface TaskListProps {
  onSelectTask: (task: string) => void
  selectedTask: string
}

const TaskList: React.FC<TaskListProps> = ({ onSelectTask, selectedTask }) => {
  const [tasks, setTasks] = useState<string[]>([])
  const [newTask, setNewTask] = useState('')

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()])
      setNewTask('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-grow border border-gray-300 rounded-l px-2 py-1"
          placeholder="Add a new task"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-2 py-1 rounded-r hover:bg-blue-600"
        >
          <Plus size={20} />
        </button>
      </div>
      <ul className="space-y-2">
        {tasks.map((task, index) => (
          <li
            key={index}
            onClick={() => onSelectTask(task)}
            className={`cursor-pointer p-2 rounded ${
              selectedTask === task ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            {task}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TaskList