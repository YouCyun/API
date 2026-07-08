import { Module, DynamicModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiMakerAuthService } from './aimaker-auth.service';
import { AiMakerProxyService } from './aimaker-proxy.service';
import { AiMakerController } from './aimaker.controller';
import { ProjectBindingService } from './project-binding.service';
import { Project, ProjectVersion } from '../database/entities';

/**
 * AiMakerModule
 *
 * 封裝所有與 AIMaker 第三方平台互動的邏輯：
 *   - AiMakerAuthService  : 登入流程與 Session Cookie 的記憶體快取管理
 *   - AiMakerProxyService : 攜帶 Cookie 向 AIMaker 發送 API 請求
 *
 * 對外 Export AiMakerProxyService，供 ProjectsModule（或其他模組）注入使用。
 */
@Module({})
export class AiMakerModule {
  static forRoot(): DynamicModule {
    const imports = [
      HttpModule.registerAsync({
        useFactory: () => ({
          timeout: 30_000,
          headers: {
            Accept: 'application/json',
          },
        }),
      }),
      ConfigModule,
    ];

    // 檢查 DB_TYPE，只有 postgres 才載入 TypeOrmModule.forFeature
    const dbType = process.env.DB_TYPE;

    const providers: any[] = [AiMakerAuthService, AiMakerProxyService, ProjectBindingService];

    if (dbType !== 'disabled') {
      imports.push(TypeOrmModule.forFeature([Project, ProjectVersion]));
    }

    return {
      module: AiMakerModule,
      imports,
      controllers: [AiMakerController],
      providers,
      exports: [AiMakerProxyService],
    };
  }
}

