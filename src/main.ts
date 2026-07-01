import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --------------------------------------------------
  // CORS：允許前端跨域存取（開發環境開放所有來源）
  // --------------------------------------------------
  app.enableCors({
    origin: true,           // 開發時允許全部，正式環境改成前端網址
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-aimaker-session'],
    credentials: true,
  });

  // --------------------------------------------------
  // 全域 Validation Pipe：自動過濾非 DTO 欄位、轉換型別
  // --------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --------------------------------------------------
  // Swagger / OpenAPI 文件設定
  // --------------------------------------------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AIMaker Platform API')
    .setDescription(
      '平台後端 API — 作為中介層串接 AIMaker 第三方 AI 訓練平台。\n\n' +
        '**架構說明**\n' +
        '- 所有物件偵測與 AI 運算由 AIMaker 完成\n' +
        '- 本 API 負責身份驗證代理、Session Cookie 管理，以及本地專案資料的 CRUD\n' +
        '- 前端僅需與本 API 互動，無需直接存取 AIMaker',
    )
    .setVersion('1.0')
    .addTag('aimaker-proxy', '代理 AIMaker 平台 API（專案、版本、類別）')
    .addTag('projects', '平台本地專案管理（與 AIMaker 版本綁定）')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger UI:               http://localhost:${port}/api/docs`);
}

bootstrap();
