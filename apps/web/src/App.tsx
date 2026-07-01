import { useEffect, useState } from "react";
import type { Task } from "@planner/shared";
import { createTask, deleteTask, fetchTasks, updateTask } from "./api/tasks";

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((err: Error) => setError(err.message));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const task = await createTask({ title });
      setTasks((prev) => [task, ...prev]);
      setTitle("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleToggle(task: Task) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Planner</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}
          >
            <input
              type="checkbox"
              checked={task.status === "done"}
              onChange={() => handleToggle(task)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: task.status === "done" ? "line-through" : "none",
              }}
            >
              {task.title}
            </span>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
