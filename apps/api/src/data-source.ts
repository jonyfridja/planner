import "reflect-metadata";
import { DataSource } from "typeorm";
import { config as loadEnv } from "dotenv";
import { Task } from "./tasks/task.entity";
import { User } from "./users/user.entity";

loadEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Task, User],
  migrations: ["src/migrations/*.ts"],
});
