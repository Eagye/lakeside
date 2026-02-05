import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter to handle all errors safely
 * Prevents leaking internal errors and stack traces in production
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProd = process.env.NODE_ENV === 'production';

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine error message
    let message = 'An unexpected error occurred';
    let errorDetails: string | object | undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message =
          (exceptionResponse as { message?: string }).message ?? message;
        errorDetails = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = isProd ? 'Internal server error' : exception.message;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // Check if this is an API request or web page request
    const isApiRequest =
      request.headers.accept?.includes('application/json') ||
      request.path.startsWith('/api');

    if (isApiRequest) {
      // Send JSON response for API requests
      response.status(status).json({
        statusCode: status,
        message,
        ...(isProd ? {} : { details: errorDetails }),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      // Render error page for web requests
      response.status(status).render('error', {
        statusCode: status,
        message,
        // Don't show stack traces in production
        error: isProd ? null : exception,
      });
    }
  }
}
