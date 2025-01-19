import express from "express";
import ViteExpress from "vite-express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import path from "path";

const app = express();

app.use(express.json());
// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Initialisation de la base de données
const dbPromise = open({
  filename: "tasks.db",
  driver: sqlite3.Database,
});

// Création de la table tasks si elle n'existe pas
async function initDb() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0
    )
  `);
}

initDb().catch(console.error);

// Routes pour les tâches
app.get("/api/tasks", async (_, res) => {
  try {
    const db = await dbPromise;
    const tasks = await db.all("SELECT * FROM tasks ORDER BY id DESC");
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

    const db = await dbPromise;
    const result = await db.run(
      "INSERT INTO tasks (title) VALUES (?)",
      title
    );

    const task = {
      id: result.lastID,
      title,
      completed: false,
    };

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating task" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const db = await dbPromise;
    await db.run(
      "UPDATE tasks SET completed = ? WHERE id = ?",
      completed ? 1 : 0,
      id
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    await db.run("DELETE FROM tasks WHERE id = ?", id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting task" });
  }
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
