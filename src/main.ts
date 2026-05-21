import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// ─── GET /api/users — Full Request Flow ───────────────────────────────────────
// STEP 1 → You are here (main.ts). NestFactory starts the HTTP server.
//          When a request arrives, NestJS checks the global prefix (line 10)
//          and passes it to the router.
//
// STEP 2 → Router matches the URL to a controller method.
//          Go to: src/users/users.controller.ts:31  (findAll)
//
// STEP 3 → Controller calls the service.
//          Go to: src/users/users.service.ts:53  (findAll)
//
// STEP 4 → Service queries the DB via TypeORM repository.
//          The shape of the DB row is defined in: src/users/entities/user.entity.ts:13
//
// STEP 5 → Result travels back: service → controller → NestJS serializes it to
//          JSON and sends the HTTP response.
// ──────────────────────────────────────────────────────────────────────────────

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
