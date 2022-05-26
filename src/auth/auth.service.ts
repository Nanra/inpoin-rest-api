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
    const { username, organization, password, email, phone_number, fullname, pin, nik } = payload;

    const usernameTrimmed = username.replace(' ', '').toLowerCase();

    try {
      // Register, and Enroll user to Certificate Authority
      // Enrollment identity is saved to filesystem Wallet
      // TODO: Refactor wallet interaction to own module
      await this.caService.registerAndEnrollUser({
        username: usernameTrimmed,
        userOrg: organization,
      });

      // Hash password
      // Save username and hashed password to DB
      const hash = await bcrypt.hash(password, saltOrRounds);
      const user = await this.usersService.create({
        username: usernameTrimmed,
        password: hash,
        nik,
        pin,
        fullname,
        organization,
        email,
        phone_number
      });
      // return jwt
      const jwtPayload = {
        username: usernameTrimmed,
        organization: user.organization,
        sub: user.id,
      };
      return {
        usernameTrimmed,
        email,
        phone_number,
        access_token: this.jwtService.sign(jwtPayload),
      };
    } catch (error) {
      throw error;
    }
  }

  //validate that the user exist
  async validateUser(
    email: string,
    organization: string,
    password: string,
  ): Promise<any> {

    const user = await this.usersService.findOne(email, organization);

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      }
    }

    return null;
  }

  async login(payload: LoginDto): Promise<any> {
    const { email, organization, password } = payload;
    const user = await this.validateUser(email, organization, password);

    console.log("Payload User: " + user);
    
    if (user) {

      const {id, username, organization} = user;

      const jwtPayload = {
        username: username,
        organization: organization,
        sub: id,
      };

      return {
        username: username,
        access_token: this.jwtService.sign(jwtPayload)
      };
    }
    throw new HttpException('Invalid Email or Password', 401);
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
