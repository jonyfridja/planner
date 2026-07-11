import "reflect-metadata";
import * as Sentry from "@sentry/node";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

// Sentry/GlitchTip's NestJS integration requires init to happen before the Nest
// app is created. No-op (empty dsn) when GLITCHTIP_DSN isn't set, e.g. local dev.
Sentry.init({
  dsn: process.env.GLITCHTIP_DSN,
  tracesSampleRate: 0,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.enableCors();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = config.get<number>("PORT", 3000);
  await app.listen(port);
}

bootstrap();
