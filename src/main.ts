import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: '*',
  });
  // app.enableCors({
  //   origin: [
  //     'http://localhost:3000',
  //     'http://localhost:4001',
  //     'http://194.233.69.252:4001',
  //     'https://lms.co2eportal.com',
  //     'https://www.lms.co2eportal.com',
  //   ],
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   allowedHeaders: [
  //     'Content-Type',
  //     'Authorization',
  //     'X-Requested-With',
  //     'Accept',
  //     'Origin',
  //     'Access-Control-Allow-Headers',
  //     'Access-Control-Request-Method',
  //     'X-API-Key',
  //   ],
  //   credentials: true,
  //   exposedHeaders: ['Set-Cookie', 'Authorization'],
  // });

  // app.setGlobalPrefix('api', {
  //   exclude: ['/'],
  // });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // ✅ Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('Authentication & User Management API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  // Don't call app.listen() for serverless
  await app.init();

  return server;
}

// Serverless function handler
let cachedApp: express.Express;

export default async function handler(
  req: express.Request,
  res: express.Response,
) {
  if (!cachedApp) {
    try {
      cachedApp = await bootstrap();
    } catch (error) {
      console.error('Failed to bootstrap application:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to initialize application',
      });
      return;
    }
  }

  return cachedApp(req, res);
}
