import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Express } from 'express';
import { AppModule } from 'src/app.module';

let app: INestApplication | null = null;
let server: Express | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!server) {
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
      });

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
      );

      // no app.listen() in serverless
      await app.init();

      server = app.getHttpAdapter().getInstance();
    }

    return (server as Express)(req, res);
  } catch (err) {
    console.error('Nest serverless error:', err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
}
