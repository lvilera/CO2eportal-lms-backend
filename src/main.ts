import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  //     'https://www.lms.co2eportal.com', // Add www subdomain
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
  //   exposedHeaders: ['Set-Cookie', 'Authorization'], // Add this line
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

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
