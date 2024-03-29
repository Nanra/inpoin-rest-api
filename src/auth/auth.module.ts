import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CaModule } from 'src/ca/ca.module';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { OtpModule } from '../otp/otp.module';
import { JwtOtpStrategy } from './jwt-otp.strategy';
import { TokenModule } from 'src/token/token.module';
import { UserPointModule } from 'src/conventional-point/user-point.module';

@Module({
  imports: [
    CaModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '365d' },
    }),
    OtpModule,
    TokenModule,
    UserPointModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtOtpStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
