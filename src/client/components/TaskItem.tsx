import { Task } from "./types";
import { motion } from "framer-motion";
import { Trash2, Check } from "lucide-react";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem = ({ task, onToggleComplete, onDelete }: TaskItemProps) => {
  return (
    <div className="group relative">
      <motion.div
        className={`flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all ${
          task.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""
        }`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.button
          className="relative w-6 h-6 mr-4 flex-shrink-0"
          onClick={() => onToggleComplete(task.id)}
          whileTap={{ scale: 0.9 }}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => {}}
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className={`w-full h-full border-2 rounded-full transition-colors flex items-center justify-center ${
              task.completed
                ? "border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-white"
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </div>
        </motion.button>

        <span
          className={`flex-1 text-gray-800 dark:text-gray-200 transition-colors ${
            task.completed ? "line-through text-gray-400 dark:text-gray-500" : ""
          }`}
        >
          {task.title}
        </span>

        <motion.button
          className="ml-4 p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          onClick={() => onDelete(task.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default TaskItem; 