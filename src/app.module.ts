// dotenv/config 必須是最第一行 import，確保 .env 在 @Module() 裝飾器求値前就已載入
import 'dotenv/config';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiMakerModule } from './aimaker/aimaker.module';
import { Project } from './database/entities';

/**
 * DB_TYPE=disabled 時跳過 TypeORM 模組，讓應用程序在未架設 PostgreSQL
 * 的情況下仍可正常啟動（適用於開發階段瀏覽 Swagger）。
 * 正式環境請將 DB_TYPE 設為 postgres。
 */
const DB_ENABLED = process.env.DB_TYPE !== 'disabled';

@Module({
  imports: [
    // 全域 ConfigModule，讀取 .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 僅在 DB_ENABLED=true 時才載入 TypeORM 與 AiMakerModule
    ...(DB_ENABLED
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              type: 'postgres',
              host: config.get<string>('DB_HOST', 'localhost'),
              port: config.get<number>('DB_PORT', 5432),
              username: config.get<string>('DB_USERNAME', 'postgres'),
              password: config.get<string>('DB_PASSWORD', ''),
              database: config.get<string>('DB_DATABASE', 'aimaker_platform'),
              entities: [Project],
              // 僅開發環境自動同步 Schema；正式環境務必使用 Migration
              synchronize: config.get<string>('NODE_ENV') !== 'production',
              logging: config.get<string>('NODE_ENV') === 'development',
            }),
          }),
          AiMakerModule.forRoot(),
        ]
      : [AiMakerModule.forRoot()]),
  ],
})
export class AppModule {}
