import { Injectable } from '@nestjs/common';
import { ConfigService } from '@/common/services/config.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken:string , refreshToken:string , profile: Profile) {
    const { id, emails, displayName, photos } = profile;

    console.log("profile",profile)
    const email = emails?.[0]?.value;
    console.log("email",email)

    if (!email) {
      throw new Error('Email not found from Google');
    }
    return {
      googleId: id,
      email,
      fullName: displayName ?? email,
      avatar: photos?.[0]?.value ?? null,
    };
  }
}
