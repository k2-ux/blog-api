import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

// FLOW — Google OAuth2 redirect:
// 1. Browser hits GET /api/auth/google
// 2. GoogleAuthGuard triggers this strategy → redirects to Google's login page
// 3. User logs in on Google
// 4. Google redirects to GOOGLE_CALLBACK_URL (/api/auth/google/callback)
// 5. passport-google-oauth20 exchanges the code for profile data
// 6. validate() is called with the profile — we find or create the user in DB
// 7. done(null, user) attaches the result to req.user in the controller
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    // profile.emails[0].value — primary Google email
    // profile.displayName — full name from Google account
    const token = await this.authService.findOrCreateGoogleUser({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    });
    done(null, token);
  }
}
