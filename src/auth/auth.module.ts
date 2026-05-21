import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    // UsersModule is imported so AuthService can inject UsersService.
    // UsersService is exported from UsersModule — see users.module.ts:17
    UsersModule,
    // JwtModule.registerAsync waits for ConfigService before building config
    // (same pattern as TypeOrmModule.forRootAsync in app.module.ts)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  // Both strategies are providers — NestJS instantiates them and Passport
  // registers them automatically when the module loads.
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
