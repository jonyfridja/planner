import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Task } from "../tasks/task.entity";
import { User } from "../users/user.entity";

export function buildTypeOrmOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: "postgres",
    host: config.get<string>("DB_HOST", "localhost"),
    port: config.get<number>("DB_PORT", 5432),
    username: config.get<string>("DB_USERNAME", "planner"),
    password: config.get<string>("DB_PASSWORD", "planner"),
    database: config.get<string>("DB_NAME", "planner"),
    entities: [Task, User],
    synchronize: config.get<string>("NODE_ENV", "development") !== "production",
  };
}
