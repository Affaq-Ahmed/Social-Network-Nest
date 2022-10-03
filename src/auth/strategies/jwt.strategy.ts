import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log(`JwtStrategy.validate() payload: ${JSON.stringify(payload)}`);
    const user = await this.authService.validateUser(payload.email);
    if (user) {
      return {
        userId: user._id,
        username: user.email,
        followedUsers: user.followedUsers,
      };
    } else {
      throw new UnauthorizedException();
    }
  }
}
