import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(HttpException) tells NestJS: intercept every HttpException
// (and subclasses like NotFoundException, ConflictException, etc.)
// before it reaches the default error handler.
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // ArgumentsHost is an abstraction over the request context.
    // switchToHttp() gives us the underlying Express req/res objects.
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // exception.getResponse() can be a string or an object.
    // When class-validator fails, NestJS puts an array of messages inside it.
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
