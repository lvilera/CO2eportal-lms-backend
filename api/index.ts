import { NestFactory } from '@nestjs/core';
import { createServer } from '@vercel/node';
import { AppModule } from 'src/app.module';

let server: any;

export default async function handler(req: any, res: any) {
  if (!server) {
    const app = await NestFactory.create(AppModule, { bodyParser: false });
    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    server = createServer(expressApp);
  }

  return server.emit('request', req, res);
}
