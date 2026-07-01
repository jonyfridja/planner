import type { CreateTaskDto, Task, UpdateTaskDto } from "@planner/shared";

const BASE_URL = "/api/tasks";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export function fetchTasks(): Promise<Task[]> {
  return fetch(BASE_URL).then((res) => handle<Task[]>(res));
}

export function createTask(dto: CreateTaskDto): Promise<Task> {
  return fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  }).then((res) => handle<Task>(res));
}

export function updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
  return fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  }).then((res) => handle<Task>(res));
}

export function deleteTask(id: string): Promise<void> {
  return fetch(`${BASE_URL}/${id}`, { method: "DELETE" }).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
  });
}
