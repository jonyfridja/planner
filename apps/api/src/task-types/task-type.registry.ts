import { BadRequestException, Injectable } from "@nestjs/common";
import type { TaskTypeDefinition } from "./task-type-definition.interface";

@Injectable()
export class TaskTypeRegistry {
  private readonly definitions = new Map<string, TaskTypeDefinition>();

  register(definition: TaskTypeDefinition): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Duplicate task type "${definition.type}"`);
    }
    this.definitions.set(definition.type, definition);
  }

  get(type: string): TaskTypeDefinition {
    const definition = this.definitions.get(type);
    if (!definition) {
      throw new BadRequestException(`Unknown task type "${type}"`);
    }
    return definition;
  }

  has(type: string): boolean {
    return this.definitions.has(type);
  }

  list(): TaskTypeDefinition[] {
    return [...this.definitions.values()];
  }
}
