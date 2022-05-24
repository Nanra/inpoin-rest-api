import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { EnrollAdminDto } from './dto/enroll-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ValidatePinDto } from './dto/validate-pin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOkResponse({ description: "Account has been registered"})
  @ApiUnauthorizedResponse({ description: "Username has been used"})
  register(@Body() payload: RegisterDto): Promise<string> {
    return this.authService.register(payload);
  }
  @Post('login')
  @ApiOkResponse({ description: "Login successful"})
  @ApiUnauthorizedResponse({ description: "Invalid login"})
  login(@Body() payload: LoginDto): Promise<string> {
    // console.log(payload)
    return this.authService.login(payload);
  }
  @Post('enroll-admin')
  @ApiOkResponse({ description: "Organization has been granted admin authority"})
  @ApiUnauthorizedResponse({ description: "Invalid"})
  enrollAdmin(@Body() payload: EnrollAdminDto): Promise<any> {
    return this.authService.enrollAdmin(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pin/validate')
  @ApiOkResponse({ description: "User PIN Validated"})
  @ApiUnauthorizedResponse({ description: "Can Not Validate User PIN"})
  validateUserPin(
    @Req() { user: { username } },
    @Body() payload: ValidatePinDto): Promise<any> {
    return this.authService.validateUserPin(username, payload.pin);
  }
}
