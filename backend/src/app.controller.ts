import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/health')
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  // Test route to trigger server error (for email alert testing)
  @Get('test-error')
  testError() {
    throw new InternalServerErrorException('Test error for monitoring - this should trigger email alert');
  }

  // Test route with unhandled error
  @Get('test-error-unhandled')
  testErrorUnhandled() {
    throw new Error('Unhandled test error - this should also trigger email alert');
  }
}
