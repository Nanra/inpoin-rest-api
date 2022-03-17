import { HttpException, Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from "src/users/users.service";
import * as otpGenerator from "otp-generator";
import * as SibApiV3Sdk from "sib-api-v3-sdk";
import { Repository } from "typeorm";
import { Otp } from "./otp.entitiy";
import { response } from "express";
import { EmailService } from "src/email/email.service";



@Injectable ()

export class OtpService {
    constructor(
        private userService: UsersService,
        private emailService: EmailService,
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        ) {}
    
    
    async generateOtp (userId: number){
        const user = await this.userService.findById(userId);
        const otpCode = otpGenerator.generate(6, { 
            digits: true, 
            lowerCaseAlphabets: false, 
            upperCaseAlphabets: false, 
            specialChars: false 
        });
        const otpLog = {
            user_id: user.id, 
            email: user.email, 
            otp_code: otpCode,
            expired_at: new Date(Date.now() + (15 * 60 * 1000)).toISOString(),
            verified_at: null,
            verified: false 
        };
        const created = await this.otpRepository.save(otpLog)
        
        this.emailService.apiKey()

        let apiInstance = await new SibApiV3Sdk.TransactionalEmailsApi();

        let sendSmtpEmail = await new SibApiV3Sdk.SendSmtpEmail();
    
            sendSmtpEmail.subject = "OTP Verification";
            sendSmtpEmail.htmlContent = otpCode;
            sendSmtpEmail.sender = {"name":"MyInpoin","email":"emilliokanz@gmail.com"};
            sendSmtpEmail.to = [{"email":user.email,"name":user.username}];
            sendSmtpEmail.headers = {"Some-Custom-Name":"unique-id-1234"};
            sendSmtpEmail.params = {"parameter":"My param value","subject":"New Subject"};
    
        apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
            console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        }, function(error) {
            console.error(error);
        });

        return {apiInstance, ...created, phone_number: user.phone_number }

    }

    async validateOtp(user_id: number, otpCode: string) {
        const otp = await this.getLatestOtpByUserId(user_id);

        // Check if OTP Already used
        if (otp.verified) {
            throw new HttpException('OTP Code Already Used', HttpStatus.BAD_REQUEST);
        }

        // Check if OTP Expired
        const { expired_at } = otp;
        const expiredAt = new Date(expired_at).getTime();
        if (expiredAt < Date.now()) {
            throw new HttpException('OTP Code Expired', HttpStatus.BAD_REQUEST);
        }
        
        if (otp.otp_code != otpCode) {
            throw new HttpException('OTP Code Invalid', HttpStatus.BAD_REQUEST);
        }

        otp.verified = true;
        otp.verified_at = new Date().toISOString();

        this.otpRepository.save(otp);

        return response.statusCode = HttpStatus.OK;
    }

    async getLatestOtpByUserId(user_id: number) {
        const otp = await this.otpRepository.findOne({
            where: { user_id },
            order: { created_at: 'DESC' },
        })
        return otp
    }
}

