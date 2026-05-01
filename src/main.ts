import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes will be prefixed with /api
  app.setGlobalPrefix('api');

  // Automatically validate every incoming request body against its DTO.
  // whitelist: strips properties that have no decorators in the DTO.
  // forbidNonWhitelisted: throws 400 if any extra property is sent.
  // transform: auto-converts plain JSON to typed DTO class instances.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Our custom global exception filter formats every error response consistently.
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: ${await app.getUrl()}/api`);
}
bootstrap();
