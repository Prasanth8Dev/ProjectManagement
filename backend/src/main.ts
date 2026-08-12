import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — allow localhost, any local-network IP, and the deployed frontend URL(s)
  // Set FRONTEND_URL (comma-separated for multiple) in production, e.g. https://projecthub.vercel.app
  const extraOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      const allowed =
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
        /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
        /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
        /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
        extraOrigins.includes(origin);
      callback(allowed ? null : new Error(`CORS: blocked origin ${origin}`), allowed);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Project Management API')
    .setDescription('Complete REST API for Team & Project Management (Jira-like)')
    .setVersion('1.0')
    .addTag('Users', 'User management endpoints')
    .addTag('Teams', 'Team management endpoints')
    .addTag('Projects', 'Project management endpoints')
    .addTag('Tasks', 'Task management endpoints')
    .addTag('Subtasks', 'Subtask management endpoints')
    .addTag('Checklists', 'Checklist management endpoints')
    .addTag('Comments', 'Comment management endpoints')
    .addTag('Attachments', 'Attachment management endpoints')
    .addTag('Daily Updates', 'Daily work update endpoints')
    .addTag('Milestones', 'Milestone management endpoints')
    .addTag('Labels', 'Label management endpoints')
    .addTag('Kanban', 'Kanban board endpoints')
    .addTag('Search', 'Global search endpoints')
    .addTag('Reports', 'Reporting endpoints')
    .addTag('Activity', 'Activity log endpoints')
    .addTag('Dashboard', 'Dashboard stats endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Ensure uploads directory exists
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const absoluteUploadDir = path.resolve(uploadDir);
  if (!fs.existsSync(absoluteUploadDir)) {
    fs.mkdirSync(absoluteUploadDir, { recursive: true });
  }

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
