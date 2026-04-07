import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  errorCode?: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorResponse = this.mapException(exception, request.url);

    if (errorResponse.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} failed: ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} failed: ${errorResponse.message}`,
      );
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private mapException(exception: unknown, path: string): ErrorResponseBody {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.createResponse(
        this.mapPrismaStatus(exception),
        this.mapPrismaMessage(exception),
        path,
        exception.code,
      );
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return this.createResponse(
        HttpStatus.BAD_REQUEST,
        'The request could not be processed due to invalid database input.',
        path,
        'PRISMA_VALIDATION_ERROR',
      );
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return this.createResponse(
        HttpStatus.SERVICE_UNAVAILABLE,
        'The database connection is unavailable right now.',
        path,
        'PRISMA_INIT_ERROR',
      );
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const extracted = this.extractHttpExceptionPayload(
        exceptionResponse as string | Record<string, unknown>,
      );

      return this.createResponse(
        statusCode,
        extracted.message,
        path,
        extracted.errorCode,
        extracted.details,
      );
    }

    return this.createResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred. Please try again later.',
      path,
      'INTERNAL_SERVER_ERROR',
    );
  }

  private extractHttpExceptionPayload(
    response: string | Record<string, unknown>,
  ): { message: string; errorCode?: string; details?: unknown } {
    if (typeof response === 'string') {
      return { message: response };
    }

    const message = Array.isArray(response.message)
      ? response.message.join(', ')
      : typeof response.message === 'string'
        ? response.message
        : 'Request failed.';

    return {
      message,
      errorCode:
        typeof response.errorCode === 'string' ? response.errorCode : undefined,
      details: response.details,
    };
  }

  private mapPrismaStatus(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpStatus {
    switch (exception.code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2003':
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      case 'P2021':
        return HttpStatus.SERVICE_UNAVAILABLE;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }

  private mapPrismaMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    switch (exception.code) {
      case 'P2002':
        return 'A record with the same unique value already exists.';
      case 'P2003':
        return 'A related record was not found for this request.';
      case 'P2021':
        return 'The required database table does not exist yet.';
      case 'P2025':
        return 'The requested record could not be found.';
      default:
        return 'A database error occurred while processing the request.';
    }
  }

  private createResponse(
    statusCode: number,
    message: string,
    path: string,
    errorCode?: string,
    details?: unknown,
  ): ErrorResponseBody {
    return {
      success: false,
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      message,
      errorCode,
      details,
    };
  }
}
