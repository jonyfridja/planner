import type { TaskTypeSummary } from "@planner/shared";

const BASE_URL = "/api/task-types";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export function fetchTaskTypes(): Promise<TaskTypeSummary[]> {
  return fetch(BASE_URL).then((res) => handle<TaskTypeSummary[]>(res));
}
