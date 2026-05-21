import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';

// @Module is the decorator that turns a plain class into a NestJS module.
// A module is a logical boundary — it groups related controllers and services.
//
// The root AppModule is the entry point NestJS reads at startup.
// Every other module gets imported here (or into another module that is).
@Module({
  imports: [
    // ConfigModule.forRoot() reads the .env file and makes all values
    // available via ConfigService throughout the app.
    // isGlobal: true means we never need to import ConfigModule again in other modules.
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeOrmModule.forRootAsync() sets up the single shared database connection.
    // "Async" means we wait for ConfigService to be ready before building the config object.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        // Auto-discover all entity files so TypeORM knows which tables exist.
        autoLoadEntities: true,
        // synchronize: false — we use migrations to manage schema changes.
        // Never set this to true in production; it can drop columns silently.
        synchronize: false,
      }),
    }),

    UsersModule,
    PostsModule,
    AuthModule,
  ],
})
export class AppModule {}
