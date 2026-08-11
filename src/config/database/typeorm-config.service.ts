import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DATABASE_CONFIG } from './database.config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeOrmCongifService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig =
      this.config.getOrThrow<TypeOrmModuleOptions>(DATABASE_CONFIG);
    const isDev = this.config.get('NODE_ENV') === 'development';
    return {
      ...dbConfig,
      autoLoadEntities: true, // tự load entities
      synchronize: false, // dùng migration
      logging: isDev ? ['error', 'warn', 'query'] : ['error'],
      migrationsRun: false, // Tự chạy migreation
      retryAttempts: 5, // nếu lần kết nối đầu tiên không thành công thì kết nối tối đa 5 lần
      retryDelay: 3000, // mỗi lần thử lại cách nhau 3s
      namingStrategy: new SnakeNamingStrategy(), // Tạo bảng hay cột, typeOrm tự động chuyển sang kiểu snake
    };
  }
}
