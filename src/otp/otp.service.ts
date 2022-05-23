import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import * as otpGenerator from 'otp-generator';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { Repository } from 'typeorm';
import { Otp } from './otp.entitiy';
import { response } from 'express';
import { EmailService } from 'src/email/email.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  constructor(
    private userService: UsersService,
    private emailService: EmailService,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async generateOtp(userId: number) {
    const user = await this.userService.findById(userId);
    const otpCode = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const otpLog = {
      user_id: user.id,
      email: user.email,
      otp_code: otpCode,
      expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      verified_at: null,
      verified: false,
    };
    const created = await this.otpRepository.save(otpLog);

    const mailConfig = await this.emailService.getConfig();


    let info = {}
    try {
      var transporter = nodemailer.createTransport( {
        service:  mailConfig.service,
        auth: {
          user: mailConfig.auth.user,
          pass: mailConfig.auth.pass
        }
      });
      var mailOpts = {
        from: mailConfig.sender,
        to: user.email,
        subject: 'Inpoin OTP',
        text : 'Please enter the OTP Code in the App to login',
        html : `<h1>${otpCode}</h1>`
      };
      info = await transporter.sendMail(mailOpts)
    } catch (err) {
      console.log('error sending email through smtp')
      console.log(err)
    }

    return { ...created, phone_number: user.phone_number, info }
  }

  async validateOtp(user_id: number, otpCode: string) {
    const otp = await this.getLatestOtpByUserId(user_id);

    // Check if Last Generated OTP Already used
    if (otp.verified) {

      // Real Logic
      // throw new HttpException('OTP Code Already Verified', HttpStatus.BAD_REQUEST);

      // Logic For Demo Purpose
      response.statusCode = HttpStatus.OK;
      response.statusMessage = `OTP Code Already Used & Verified at ${otp.verified_at}`;
      return (response);
    }

    // Check if OTP Expired
    const { expired_at } = otp;
    const expiredAt = new Date(expired_at).getTime();
    if (expiredAt < Date.now()) {
      throw new HttpException('OTP Code Expired', HttpStatus.BAD_REQUEST);
    }

    // For Demo Purpose
    if (otpCode == "111111") {
      otp.verified = true;
      otp.verified_at = new Date().toISOString();
      this.otpRepository.save(otp);
      return (response.statusCode = HttpStatus.OK);
    }

    if (otp.otp_code != otpCode) {
      throw new HttpException('OTP Code Invalid', HttpStatus.BAD_REQUEST);
    }

    otp.verified = true;
    otp.verified_at = new Date().toISOString();

    this.otpRepository.save(otp);

    return (response.statusCode = HttpStatus.OK);
  }

  async getLatestOtpByUserId(user_id: number) {
    const otp = await this.otpRepository.findOne({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
    return otp;
  }
}
