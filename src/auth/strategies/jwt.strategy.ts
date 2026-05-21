import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// FLOW — JWT protected route:
// 1. Request arrives with  Authorization: Bearer <token>  header
// 2. JwtAuthGuard (guards/jwt-auth.guard.ts) triggers this strategy
// 3. passport-jwt extracts the token from the header and verifies the signature
//    using JWT_SECRET from .env — if invalid or expired → 401 automatically
// 4. validate() is called with the decoded payload
// 5. Whatever validate() returns is attached to req.user in the controller
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Look for the token in the Authorization: Bearer <token> header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  // payload is the decoded JWT body — we signed it in auth.service.ts with { sub, email }
  // Return value becomes req.user in any controller that uses @UseGuards(JwtAuthGuard)
  validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
