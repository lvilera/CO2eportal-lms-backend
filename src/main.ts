import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const express = require('express');

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors();
  await app.init();
  return server;
}

let cachedApp: any;

export default async function handler(req: any, res: any) {
  console.log('Function invoked');

  if (!cachedApp) {
    console.log('Bootstrapping application...');
    try {
      cachedApp = await bootstrap();
      console.log('Application bootstrapped successfully');
    } catch (error) {
      console.error('Bootstrap error:', error);
      return res.status(500).json({
        error: 'Bootstrap failed',
        details: error.message,
      });
    }
  }

  return cachedApp(req, res);
}
