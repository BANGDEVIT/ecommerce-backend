import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PinoLoggerModule } from './config/logger/logger.module';
import { AppThrottlerModule } from './config/throttler/throttler.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TestModule } from './test/test.module';
import { CorrelationIdMiddleware } from './core/middlewares/correlation-id.middleware';
import { AllExceptionsFilter } from './core/filters/all-exception.filter';
import { allConfigs } from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmCongifService } from './config/database/typeorm-config.service';

const envFile =
  process.env.NODE_ENV === 'production'
    ? ['.env.prod', '.env']
    : ['.env.dev', '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      envFilePath: envFile,
      load: allConfigs,
    }),
    PinoLoggerModule,
    AppThrottlerModule,
    TypeOrmModule.forRootAsync({
      // phụ thuộc vào cấu hình config service, mà config Service được tạo thông qua DI , nên TypeOrm ko thể lấy config ngay lập tức mà cần chờ nest chạy xong tất cả dependece trước rôi mới lấy ra dùng được
      useClass: TypeOrmCongifService,
    }),
    TestModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
