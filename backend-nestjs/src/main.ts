// là class lõi của Nest để tạo Nestjs application
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from './common/services/config.service';
import { configSwagger } from './core/configs/swagger.config';
import { Logger } from '@nestjs/common';
import { corsConfig } from './core/configs/cors.config';
import helmet from 'helmet';
import compression from 'compression';
import { urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // This tells Express to read the X-Forwarded-For header sent by Nginx
  app.set('trust proxy', 1);
  const configService = app.get(ConfigService);

  // get config
  const API_PREFIX = configService.get('API_PREFIX');
  const API_DEFAULT_VERSION = configService.get('API_DEFAULT_VERSION');
  const PORT = configService.get('PORT');
  const API_URL = configService.get('API_URL');
  const NODE_ENV = configService.get('NODE_ENV');

  // Register global 3rd-party middlewares here
  app.use(
    helmet(
      NODE_ENV === 'development'
        ? {
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Swagger UI
              },
            },
            frameguard: { action: 'deny' },
            hidePoweredBy: true,
            hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
            noSniff: true,
            dnsPrefetchControl: { allow: false },
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
          }
        : {
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                scriptSrc: ["'self'"],
              },
            },
            frameguard: { action: 'deny' },
            hidePoweredBy: true,
            hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
            noSniff: true,
            dnsPrefetchControl: { allow: false },
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
          },
    ),
  );
  app.use(compression());
  app.use(cookieParser());

  // Increase payload size limits
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Set global prefix and versioning (/api/v1)
  app.setGlobalPrefix(API_PREFIX, {
    exclude: ['queues'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: String(API_DEFAULT_VERSION),
  });

  // Setup Swagger
  const { swaggerEnabled, swaggerUrl } = NODE_ENV === "development" ? configSwagger(app, configService): {swaggerEnabled: false, swaggerUrl: ""};


  // Setup CORS
  const corsCfg = corsConfig(configService);
  app.enableCors(corsCfg);


  // Start server
  try {
    await app.listen(PORT);
    Logger.log(`Server is running on ${API_URL}`, 'Bootstrap');

    if (swaggerEnabled) {
      Logger.log(`Swagger is running on ${swaggerUrl}`, 'Bootstrap');
    }
    Logger.log(`Bull Board is running on ${API_URL}/queues`, 'Bootstrap');
  } catch (error) {
    Logger.error(error, 'Bootstrap');
    process.exit(1);
  }
}
bootstrap();
