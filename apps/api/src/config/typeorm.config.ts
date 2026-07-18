import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Task } from "../tasks/task.entity";
import { User } from "../users/user.entity";

export function buildTypeOrmOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: "postgres",
    url: config.getOrThrow<string>("DATABASE_URL"),
    entities: [Task, User],
    synchronize: config.get<string>("NODE_ENV", "development") !== "production",
  };
}
