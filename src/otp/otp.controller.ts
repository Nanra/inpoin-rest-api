import { Req, Body, Post, UseGuards, Controller, Get } from '@nestjs/common';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { ValidateOtpDto } from './dto/otp.dto';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('generate')
  async getOtp(@Req() req) {
    return this.otpService.generateOtp(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  async validateOtp(
    @Req() { user: { userId } },
    @Body() { otp_code }: ValidateOtpDto,
  ) {
    return this.otpService.validateOtp(userId, otp_code);
  }
}
