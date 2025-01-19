import express from "express";
import ViteExpress from "vite-express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const app = express();
const TASKS_FILE = "tasks.json";

app.use(express.json());
// Configure CORS for all origins in production
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Helper function to read tasks
async function readTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data).tasks;
  } catch (error) {
    return [];
  }
}

// Helper function to write tasks
async function writeTasks(tasks: Task[]): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks }, null, 2));
}

// Routes pour les tâches
app.get("/api/tasks", async (_, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const tasks = await readTasks();
    const newTask: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map((t: Task) => t.id)) + 1 : 1,
      title,
      completed: false,
    };

    tasks.unshift(newTask);
    await writeTasks(tasks);
    res.json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating task" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t: Task) => t.id === parseInt(id));
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    tasks[taskIndex].completed = completed;
    await writeTasks(tasks);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const filteredTasks = tasks.filter((t: Task) => t.id !== parseInt(id));
    await writeTasks(filteredTasks);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting task" });
  }
});

const PORT = parseInt(process.env.PORT || '3000', 10);

ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}...`)
);
