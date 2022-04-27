import { Req, Body, Post, UseGuards, Controller, Get } from '@nestjs/common';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { ValidateOtpDto } from './dto/otp.dto';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('generate')
  @ApiOkResponse({ description: "OTP has been sent to email"})
  @ApiUnauthorizedResponse({ description: "Invalid"})
  async getOtp(@Req() req) {
    return this.otpService.generateOtp(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  @ApiOkResponse({ description: "OTP verified"})
  @ApiUnauthorizedResponse({ description: "Invalid OTP"})
  async validateOtp(
    @Req() { user: { userId } },
    @Body() { otp_code }: ValidateOtpDto,
  ) {
    return this.otpService.validateOtp(userId, otp_code);
  }
}
