"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'x-aimaker-session'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('AIMaker Platform API')
        .setDescription('平台後端 API — 作為中介層串接 AIMaker 第三方 AI 訓練平台。\n\n' +
        '**架構說明**\n' +
        '- 所有物件偵測與 AI 運算由 AIMaker 完成\n' +
        '- 本 API 負責身份驗證代理、Session Cookie 管理，以及本地專案資料的 CRUD\n' +
        '- 前端僅需與本 API 互動，無需直接存取 AIMaker')
        .setVersion('1.0')
        .addTag('aimaker-proxy', '代理 AIMaker 平台 API（專案、版本、類別）')
        .addTag('projects', '平台本地專案管理（與 AIMaker 版本綁定）')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger UI:               http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map