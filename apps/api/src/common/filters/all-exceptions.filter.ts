import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import * as Sentry from "@sentry/node";
import type { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttpException
      ? exception.getResponse()
      : { statusCode: status, message: "Internal server error" };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      request.log.error({ err: exception }, `Unhandled exception: ${request.method} ${request.url}`);
      Sentry.captureException(exception);
    } else {
      request.log.warn({ err: exception }, `Request error: ${request.method} ${request.url}`);
    }

    response.status(status).json(body);
  }
}
