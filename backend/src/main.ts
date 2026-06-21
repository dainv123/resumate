import { webcrypto } from 'crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
    'http://2r4p3zcg-5000.asse.devtunnels.ms',
    'https://2r4p3zcg-5000.asse.devtunnels.ms',
    'http://localhost:5000',
    'http://localhost:3000',
    'https://appearance-lectures-achieve-recommended.trycloudflare.com',
  ];

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.sendStatus(204);
    } else {
      next();
    }
  });

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
