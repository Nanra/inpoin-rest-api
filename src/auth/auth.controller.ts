import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EnrollAdminDto } from './dto/enroll-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() payload: RegisterDto): Promise<string> {
    return this.authService.register(payload);
  }
  @Post('login')
  login(@Body() payload: LoginDto): Promise<string> {
    console.log(payload)
    return this.authService.login(payload);
  }
  @Post('enroll-admin')
  enrollAdmin(@Body() payload: EnrollAdminDto): Promise<any> {
    return this.authService.enrollAdmin(payload);
  }
}
