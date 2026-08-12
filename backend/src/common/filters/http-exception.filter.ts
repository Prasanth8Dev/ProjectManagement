import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.message;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || exception.message;
        error = (resp.error as string) || exception.name;
        details = resp.details;
        if (Array.isArray(resp.message)) {
          details = resp.message;
          message = 'Validation failed';
          error = 'Bad Request';
        }
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          statusCode = HttpStatus.CONFLICT;
          error = 'Conflict';
          message = `A record with this ${(exception.meta?.target as string[])?.join(', ')} already exists`;
          break;
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          error = 'Not Found';
          message = 'The requested resource was not found';
          break;
        case 'P2003':
          statusCode = HttpStatus.BAD_REQUEST;
          error = 'Bad Request';
          message = 'Foreign key constraint failed';
          break;
        default:
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          error = 'Database Error';
          message = exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = 'Invalid data provided to database';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    this.logger.error(
      `${request.method} ${request.url} ${statusCode} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json({
      success: false,
      error,
      message,
      statusCode,
      ...(details !== undefined && { details }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
