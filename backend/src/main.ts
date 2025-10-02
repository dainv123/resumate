import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Enable CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
    'http://localhost:5000',
    'https://appearance-lectures-achieve-recommended.trycloudflare.com'
  ];
  
  // Add domain from environment if available
  if (process.env.DOMAIN_NAME) {
    allowedOrigins.push(`http://${process.env.DOMAIN_NAME}:5000`);
    allowedOrigins.push(`https://${process.env.DOMAIN_NAME}:5000`);
  }
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  
  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
