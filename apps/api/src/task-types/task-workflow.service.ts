import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../tasks/task.entity";
import { User } from "../users/user.entity";
import { TaskTypeRegistry } from "./task-type.registry";
import type { Role, TransitionTaskDto } from "@planner/shared";

@Injectable()
export class TaskWorkflowService {
  constructor(
    @InjectRepository(Task) private readonly tasksRepo: Repository<Task>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly registry: TaskTypeRegistry,
  ) {}

  private async getOrThrow(id: string): Promise<Task> {
    const task = await this.tasksRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  private async assertEligibleAssignee(assigneeId: string, requiredRole: Role): Promise<void> {
    const assignee = await this.usersRepo.findOneBy({ id: assigneeId });
    if (!assignee) {
      throw new BadRequestException(`Assignee ${assigneeId} not found`);
    }
    if (!assignee.roles.includes(requiredRole)) {
      throw new UnprocessableEntityException(
        `Assignee "${assignee.name}" must have the "${requiredRole}" role for this step`,
      );
    }
  }

  async transition(id: string, dto: TransitionTaskDto): Promise<Task> {
    const task = await this.getOrThrow(id);
    if (task.closed) {
      throw new UnprocessableEntityException("Closed tasks are immutable");
    }

    const definition = this.registry.get(task.taskType);
    const statusDef = definition.getStatus(dto.status);
    if (!statusDef) {
      throw new BadRequestException(
        `Invalid status ${dto.status} for task type "${task.taskType}"`,
      );
    }

    if (dto.status > task.status && dto.status !== task.status + 1) {
      throw new UnprocessableEntityException(
        `Cannot skip statuses: from ${task.status} you may only advance to ${task.status + 1}`,
      );
    }

    const mergedData = { ...task.data, ...(dto.data ?? {}) };
    const result = await definition.validateData(dto.status, mergedData);
    if (!result.valid) {
      throw new BadRequestException(result.errors);
    }

    await this.assertEligibleAssignee(dto.assigneeId, statusDef.requiredRole);

    task.status = dto.status;
    task.userId = dto.assigneeId;
    task.data = { ...task.data, ...result.data };
    return this.tasksRepo.save(task);
  }

  async close(id: string, assigneeId: string): Promise<Task> {
    const task = await this.getOrThrow(id);
    if (task.closed) {
      throw new UnprocessableEntityException("Task is already closed");
    }
    const definition = this.registry.get(task.taskType);
    if (task.status !== definition.getFinalStatus()) {
      throw new UnprocessableEntityException(
        `Task must be at final status ${definition.getFinalStatus()} to close`,
      );
    }
    await this.assertEligibleAssignee(assigneeId, definition.getStatus(task.status)!.requiredRole);
    task.closed = true;
    task.userId = assigneeId;
    return this.tasksRepo.save(task);
  }

  async reopen(id: string, assigneeId: string): Promise<Task> {
    const task = await this.getOrThrow(id);
    if (!task.closed) {
      throw new UnprocessableEntityException("Task is not closed");
    }
    const definition = this.registry.get(task.taskType);
    await this.assertEligibleAssignee(assigneeId, definition.getStatus(task.status)!.requiredRole);
    task.closed = false;
    task.userId = assigneeId;
    return this.tasksRepo.save(task);
  }
}
