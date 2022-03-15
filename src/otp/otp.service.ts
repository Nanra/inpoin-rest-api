import { HttpException, Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from "src/users/users.service";
import * as otpGenerator from "otp-generator";
import { Repository } from "typeorm";
import { Otp } from "./otp.entitiy";
import { response } from "express";


@Injectable ()

export class OtpService {
    constructor(
        private userService: UsersService,
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        ) {}
    
    
    async generateOtp (userId: number){
        const user = await this.userService.findById(userId);
        console.log(user.phone_number)
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
        return created;
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

