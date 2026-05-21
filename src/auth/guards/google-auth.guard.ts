import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Extend AuthGuard('google') — triggers the Google OAuth2 redirect flow.
// On GET /auth/google: redirects the browser to Google's login page.
// On GET /auth/google/callback: exchanges the code for tokens, calls GoogleStrategy.validate().
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
