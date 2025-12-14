import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { NotificationsService } from '../../modules/notifications/notifications.service';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    @Optional() private readonly notificationsService?: NotificationsService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      stack = exception.stack;
    }

    // Log error for monitoring
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      stack,
    );

    // Send email notification for critical server errors (5xx)
    // This includes: 500 (Internal Server Error), 502 (Bad Gateway),
    // 503 (Service Unavailable), 504 (Gateway Timeout)
    const isServerError = status >= 500 && status < 600;

    if (
      isServerError &&
      this.notificationsService &&
      process.env.NODE_ENV === 'production'
    ) {
      try {
        // Send email asynchronously without blocking the response
        this.notificationsService
          .notifyServerError({
            method: request.method,
            url: request.url,
            error: error,
            message: message,
            stack: stack,
            statusCode: status,
            timestamp: new Date().toISOString(),
            userAgent: request.headers['user-agent'],
            ip:
              (request.ip ||
                request.headers['x-forwarded-for'] ||
                request.headers['x-real-ip'] ||
                'unknown') as string,
          })
          .catch((emailError) => {
            // Don't fail the request if email fails
            this.logger.error(
              `Failed to send error notification email: ${emailError.message}`,
            );
          });
      } catch (emailError) {
        // Don't fail the request if email fails
        this.logger.error(
          `Failed to send error notification email: ${emailError.message}`,
        );
      }
    }

    // Don't expose internal errors in production
    if (
      process.env.NODE_ENV === 'production' &&
      status === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      message = 'Something went wrong';
      error = 'InternalServerError';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    response.status(status).json(errorResponse);
  }
}
