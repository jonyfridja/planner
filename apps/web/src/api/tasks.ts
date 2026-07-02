import type {
  AssigneeActionDto,
  CreateTaskDto,
  Task,
  TransitionTaskDto,
  UpdateTaskDto,
} from "@planner/shared";

const BASE_URL = `${import.meta.env.BASE_URL}api/tasks`;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export interface FetchTasksParams {
  search?: string;
  assigneeId?: string;
}

export function fetchTasks(params: FetchTasksParams = {}): Promise<Task[]> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.assigneeId) searchParams.set("assigneeId", params.assigneeId);
  const query = searchParams.toString();
  return fetch(query ? `${BASE_URL}?${query}` : BASE_URL).then((res) => handle<Task[]>(res));
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

export function transitionTask(id: string, dto: TransitionTaskDto): Promise<Task> {
  return fetch(`${BASE_URL}/${id}/transition`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  }).then((res) => handle<Task>(res));
}

export function closeTask(id: string, dto: AssigneeActionDto): Promise<Task> {
  return fetch(`${BASE_URL}/${id}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  }).then((res) => handle<Task>(res));
}

export function reopenTask(id: string, dto: AssigneeActionDto): Promise<Task> {
  return fetch(`${BASE_URL}/${id}/reopen`, {
    method: "POST",
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
