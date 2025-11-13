import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

let server: any;

export default async function handler(req: any, res: any) {
  try {
    if (!server) {
      const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
      });

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
        }),
      );

      await app.init();
      server = app.getHttpAdapter().getInstance();
    }

    return server(req, res);
  } catch (e) {
    console.error('Lambda error:', e);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
