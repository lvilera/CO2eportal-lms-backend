import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Express } from 'express';
import { AppModule } from 'src/app.module';

let app: INestApplication;
let server: Express;

export default async function handler(req: any, res: any) {
  try {
    if (!server) {
      // create Nest app once per Lambda container
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
      });

      app
        .useGlobalPipes
        // keep same options you use locally
        // import ValidationPipe at top if you want to reuse
        ();

      await app.init();
      server = app.getHttpAdapter().getInstance();
    }

    return server(req, res);
  } catch (err) {
    console.error('Nest serverless error:', err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
}
