import type { User } from "@planner/shared";

const BASE_URL = "/api/users";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export function fetchUsers(): Promise<User[]> {
  return fetch(BASE_URL).then((res) => handle<User[]>(res));
}
