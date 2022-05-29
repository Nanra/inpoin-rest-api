import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { EnrollAdminDto } from './dto/enroll-admin.dto';
import { LoginDto } from './dto/login.dto';
import { CaService } from 'src/ca/ca.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UserPointService } from 'src/conventional-point/user-point.service';
import { TokenService } from 'src/token/token.service';
import { CreateUserPointDto } from 'src/conventional-point/dto/create-user-point.dto';

const saltOrRounds = 10;
@Injectable()
export class AuthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,

    private readonly caService: CaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userPointService: UserPointService,
    private readonly tokenService: TokenService,



  ) {}

  async issuingTokenAirDrop(username: string, phone_number: string) {

    const selectMinter = await this.connection.query(`SELECT M.USERNAME AS MINTER , M.TOKEN_ID, P.POINT_NAME, P.ID as POINT_ID FROM MINTER M INNER JOIN POINT P ON M.POINT_ID = P.ID ORDER BY P.ID ASC;`);
    
    selectMinter.forEach( async element => {
      const {minter, token_id, point_name, point_id} = element;
      let paired = false;
      let paired_at = new Date().toISOString();
      
      if (point_id == 3) {
        paired = true;
        paired_at = new Date().toISOString();
      }
      
      // Issuing Token Air Drop to User
      await this.tokenService.transferTokenFrom(minter, "Org1", username, "Org1", token_id.toString(), token_id == 1 ? "15000" : token_id == 3 ? "100" : "2000").then(() => {
        console.log(`Success Issued ${point_name}`);
      }).catch((error) => {
        throw new HttpException(`Cannot Issuing Token Air Drop: ${error.responses[0].response.message}`, HttpStatus.BAD_REQUEST);
      });
      
      const userPointPayload: CreateUserPointDto = {username, phone_number, point_name, paired, paired_at};
      console.log("Payload Point Name: " + userPointPayload.point_name);
      await this.userPointService.createUserPoint(userPointPayload);
    });
  }

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
      }).then( async () => {
        // Issuing Token Air Drop for New User
        await this.issuingTokenAirDrop(usernameTrimmed, phone_number);
      }).catch((error) => {
        console.log(`Error Register and Enrolling new User`);
        throw new BadRequestException(`Can Not Register & Enrolling User to Ledger: ${error.responses[0].response.message}`)
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

      // Issuing Token Air Drop for New User
      // await this.issuingTokenAirDrop(usernameTrimmed, phone_number);

      return {
        username: usernameTrimmed,
        email,
        phone_number,
        access_token: this.jwtService.sign(jwtPayload)
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
