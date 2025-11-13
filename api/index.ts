import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Express } from 'express';
import { AppModule } from '../dist/src/app.module'; // or '../src/app.module' depending on build

let nestApp: INestApplication;
let server: Express;

export default async function handler(req: any, res: any) {
  // lazy init – only on first request
  if (!nestApp) {
    nestApp = await NestFactory.create(AppModule, { bodyParser: false });
    await nestApp.init();
    server = nestApp.getHttpAdapter().getInstance();
  }

  return server(req, res);
}
