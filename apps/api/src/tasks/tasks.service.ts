import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { Task } from "./task.entity";
import { User } from "../users/user.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { FindTasksDto } from "./dto/find-tasks.dto";
import { TaskTypeRegistry } from "../task-types/task-type.registry";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasksRepo: Repository<Task>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly taskTypeRegistry: TaskTypeRegistry,
  ) {}

  findAll(query: FindTasksDto): Promise<Task[]> {
    const where: FindOptionsWhere<Task> = {};
    if (query.assigneeId) {
      where.userId = query.assigneeId;
    }
    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }
    return this.tasksRepo.find({ where, order: { createdAt: "DESC" } });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const definition = this.taskTypeRegistry.get(dto.taskType);
    const initialStatusDef = definition.getStatuses()[0];
    const initialStatus = initialStatusDef?.value;
    const result = await definition.validateData(initialStatus, dto.data ?? {});
    if (!result.valid) {
      throw new BadRequestException(result.errors);
    }

    const assignee = await this.usersRepo.findOneBy({ id: dto.assigneeId });
    if (!assignee) {
      throw new BadRequestException(`Assignee ${dto.assigneeId} not found`);
    }
    if (initialStatusDef && !assignee.roles.includes(initialStatusDef.requiredRole)) {
      throw new UnprocessableEntityException(
        `Assignee "${assignee.name}" must have the "${initialStatusDef.requiredRole}" role for this step`,
      );
    }

    const task = this.tasksRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      taskType: dto.taskType,
      status: initialStatus,
      closed: false,
      data: result.data ?? {},
      userId: dto.assigneeId,
    });
    return this.tasksRepo.save(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (task.closed) {
      throw new UnprocessableEntityException("Closed tasks are immutable");
    }
    Object.assign(task, dto);
    return this.tasksRepo.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    if (task.closed) {
      throw new UnprocessableEntityException("Closed tasks are immutable");
    }
    await this.tasksRepo.remove(task);
  }
}
