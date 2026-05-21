import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

// All routes here are under /api/auth  (global prefix + @Controller('auth'))
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // POST /api/auth/login
  // Body: { email, password } → returns { access_token: "..." }
  // Use this token in all protected routes: Authorization: Bearer <token>
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /api/auth/google
  // Open this URL in a browser — GoogleAuthGuard redirects to Google's login page.
  // This method body never actually runs; the guard handles the redirect.
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  // GET /api/auth/google/callback
  // Google redirects here after the user logs in.
  // GoogleAuthGuard runs GoogleStrategy.validate() → attaches { access_token } to req.user
  // We redirect the browser to the frontend URL with the token as a query param,
  // so the frontend JS can grab it from the URL and store it in localStorage.
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: any, @Res() res: Response) {
    const { access_token } = req.user;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    return res.redirect(`${frontendUrl}?token=${access_token}`);
  }

  // GET /api/auth/me — example of a JWT-protected route
  // Requires: Authorization: Bearer <token> header
  // Returns the decoded user from the token (set by JwtStrategy.validate())
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return req.user;
  }
}
