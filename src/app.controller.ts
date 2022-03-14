import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtOtpGuard } from './auth/jwt-otp.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtOtpGuard)
  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
