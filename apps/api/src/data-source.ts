import "reflect-metadata";
import { DataSource } from "typeorm";
import { config as loadEnv } from "dotenv";
import { Task } from "./tasks/task.entity";
import { User } from "./users/user.entity";

loadEnv();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5433),
  username: process.env.DB_USERNAME ?? "planner",
  password: process.env.DB_PASSWORD ?? "planner",
  database: process.env.DB_NAME ?? "planner",
  entities: [Task, User],
  migrations: ["src/migrations/*.ts"],
});
