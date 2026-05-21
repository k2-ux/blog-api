import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Extend AuthGuard('jwt') — when you put @UseGuards(JwtAuthGuard) on a route,
// Passport runs JwtStrategy.validate() automatically before the handler fires.
// If the token is missing or invalid, Passport throws 401 before your code runs.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
