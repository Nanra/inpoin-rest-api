import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class JwtOtpStrategy extends PassportStrategy(Strategy, 'otp') {
  constructor(private otpService: OtpService) {
    //configuration for strategy
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  //return decoded token. can add user data here too
  async validate(payload: any) {
    const otpValid = await this.validateOtp(payload.sub);
    if (!otpValid) {
      return null;
    }
    return {
      userId: payload.sub,
      username: payload.username,
      organization: payload.organization,
    };
  }

  // Check if user already verified OTP
  async validateOtp(userId: number) {
    const otp = await this.otpService.getLatestOtpByUserId(userId);
    if (!otp || !otp.verified) {
      return false;
    }
    return true;
  }
}
