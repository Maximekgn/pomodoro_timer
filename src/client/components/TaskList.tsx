import { useState, useEffect } from "react";
import { Task } from "./types";
import TaskItem from "./TaskItem";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListTodo } from "lucide-react";
import { API_URL } from "../config";

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await fetch(`${API_URL}/api/tasks`, {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json'
          },
          body: JSON.stringify({ title: newTask }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const task = await response.json();
        setTasks([task, ...tasks]);
        setNewTask("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const toggleTaskComplete = async (id: number) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
        body: JSON.stringify({ completed: !task.completed }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ListTodo className="w-6 h-6 text-gray-800 dark:text-white" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Tasks</h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {tasks.filter((t) => t.completed).length}/{tasks.length} completed
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Add a new task..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addTask}
            className="px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add</span>
          </motion.button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-white"></div>
        </div>
      ) : (
        <motion.ul
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <TaskItem
                  task={task}
                  onToggleComplete={toggleTaskComplete}
                  onDelete={deleteTask}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 dark:text-gray-400"
            >
              No tasks yet. Add one to get started!
            </motion.li>
          )}
        </motion.ul>
      )}
    </div>
  );
};

export default TaskList; 