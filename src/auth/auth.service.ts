import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

// FLOW — email/password login:
// AuthController.login() → this.login() → UsersService.findByEmail()
// → bcrypt.compare() → jwtService.sign() → returns { access_token }
//
// FLOW — Google login:
// GoogleStrategy.validate() → this.findOrCreateGoogleUser()
// → UsersService.findOrCreateGoogleUser() → jwtService.sign() → returns { access_token }
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // findByEmail returns the full user including password hash (unlike findAll/findOne which strip it)
    // See users.service.ts for the new findByEmail method
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.email);
  }

  async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    name: string;
  }) {
    // Delegates to UsersService — either finds existing user by googleId/email
    // or creates a new one without a password (Google users don't have one)
    const user = await this.usersService.findOrCreateGoogleUser(data);
    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    // sub (subject) is the standard JWT claim for the user's ID
    // This payload is what JwtStrategy.validate() receives after token verification
    // See strategies/jwt.strategy.ts:validate()
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
