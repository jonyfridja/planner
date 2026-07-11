import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";
import { buildTypeOrmOptions } from "./config/typeorm.config";
import { TasksModule } from "./tasks/tasks.module";
import { TaskTypesModule } from "./task-types/task-types.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === "production"
            ? undefined
            : { target: "pino-pretty", options: { singleLine: true } },
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    TaskTypesModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
