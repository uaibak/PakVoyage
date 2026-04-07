import 'dotenv/config';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { FileLogger } from './common/logging/file-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new FileLogger('Bootstrap');
  app.useLogger(logger);
  app.flushLogs();

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors) => {
        const details = validationErrors.map((validationError) => ({
          field: validationError.property,
          errors: Object.values(validationError.constraints ?? {}),
        }));

        return new BadRequestException({
          message: 'Validation failed for the request payload.',
          errorCode: 'VALIDATION_ERROR',
          details,
        });
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
  logger.log(`PakVoyage backend running on port ${process.env.PORT ?? 3001}`);
}

bootstrap().catch((error: unknown) => {
  const logger = new FileLogger('Bootstrap');
  logger.error(
    'PakVoyage backend failed to start.',
    error instanceof Error ? error.stack : undefined,
  );
  process.exit(1);
});
