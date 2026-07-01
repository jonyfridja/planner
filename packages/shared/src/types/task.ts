export type TaskStatus = number;

export interface Task {
  id: string;
  title: string;
  description: string | null;
  taskType: string;
  status: TaskStatus;
  closed: boolean;
  data: Record<string, unknown>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  taskType: string;
  assigneeId: string;
  data?: Record<string, unknown>;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
}

export interface TransitionTaskDto {
  status: number;
  assigneeId: string;
  data?: Record<string, unknown>;
}

export interface AssigneeActionDto {
  assigneeId: string;
}
