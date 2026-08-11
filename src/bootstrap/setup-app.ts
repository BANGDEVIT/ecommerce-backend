import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { APP_CONFIG } from 'src/config/app/app.config';

export function setupApp(
  app: NestExpressApplication,
  logger: Logger,
  config: ConfigService,
) {
  // Cookie parse
  app.use(cookieParser());

  // CORS
  const appCfg = config.getOrThrow<{ corsOrigin: string[] }>(APP_CONFIG);
  const allowList = appCfg.corsOrigin;
  app.enableCors({
    origin: (requestOrigin: string, callback) => {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }
      if (allowList.includes(requestOrigin)) {
        callback(null, true);
        return;
      }

      //log warning
      logger.warn(
        `CORS: blocked request from origin : "${requestOrigin}" (not in alowList)`,
      );
      callback(null, false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    credentials: true, // cookie mới được gửi qua BE
  });

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableShutdownHooks(); // shutdown an toàn và gọn hơn
}
