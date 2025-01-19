import express from "express";
import ViteExpress from "vite-express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Initialize SQLite database
const db = new Database('tasks.db');

// Create tasks table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0
  )
`);

app.use(express.json());
// Configure CORS for all origins in production
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Serve static files in production
if (isProduction) {
  const distPath = path.join(__dirname, '../..', 'dist');
  app.use(express.static(distPath));
}

// Routes pour les tâches
app.get("/api/tasks", (_, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

app.post("/api/tasks", (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = db.prepare('INSERT INTO tasks (title, completed) VALUES (?, 0)').run(title);
    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating task" });
  }
});

app.put("/api/tasks/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const result = db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating task" });
  }
});

app.delete("/api/tasks/:id", (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting task" });
  }
});

// Serve index.html for all other routes in production
if (isProduction) {
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../..', 'dist', 'index.html'));
  });
}

const PORT = parseInt(process.env.PORT || '3000', 10);

ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}...`)
);
