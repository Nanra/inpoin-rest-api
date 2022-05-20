import { HttpException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { EnrollAdminDto } from './dto/enroll-admin.dto';
import { LoginDto } from './dto/login.dto';
import { CaService } from 'src/ca/ca.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const saltOrRounds = 10;
@Injectable()
export class AuthService {
  constructor(
    private readonly caService: CaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  //to change the user register data into token
  async register(payload: RegisterDto): Promise<any> {
    const { username, organization, password, email, phone_number } = payload;

    try {
      // Register, and Enroll user to Certificate Authority
      // Enrollment identity is saved to filesystem Wallet
      // TODO: Refactor wallet interaction to own module
      await this.caService.registerAndEnrollUser({
        username,
        userOrg: organization,
      });

      // Hash password
      // Save username and hashed password to DB
      const hash = await bcrypt.hash(password, saltOrRounds);
      const user = await this.usersService.create({
        username,
        password: hash,
        organization,
        email,
        phone_number,
      });
      // return jwt
      const jwtPayload = {
        username: user.username,
        organization: user.organization,
        sub: user.id,
      };
      return {
        access_token: this.jwtService.sign(jwtPayload),
      };
    } catch (error) {
      throw error;
    }
  }

  //validate that the user exist
  async validateUser(
    username: string,
    organization: string,
    password: string,
  ): Promise<any> {
    const user = await this.usersService.findOne(username, organization);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Validate User IsPassword Match: " + isMatch);
    
    if (isMatch) {
      return user;
    }
    return null;
  }
  async login(payload: LoginDto): Promise<any> {
    const { username, organization, password } = payload;
    const user = await this.validateUser(username, organization, password);

    console.log("Payload User: " + user);
    

    if (user) {
      const jwtPayload = {
        username: user.username,
        organization: user.organization,
        sub: user.id,
      };
      return {
        access_token: this.jwtService.sign(jwtPayload),
      };
    }
    throw new HttpException('Invalid Username or Password', 401);
  }

  async enrollAdmin(payload: EnrollAdminDto): Promise<any> {
    const { organization } = payload;
    const resp = await this.caService.enrollAdmin(organization);
    return resp;
  }

  async validateUserPin(
    username: string,
    pin: string
  ): Promise<any> {
    const user = await this.usersService.findByUserPin(username, pin);
    if (user) {
      return true;
    }
    return false;
  }
}
