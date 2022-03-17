import { Controller, Get, Post } from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller()
export class EmailController{
    constructor(
        private readonly emailService : EmailService)
    {}
    @Get('email')
    sendEmail(){
        return this.emailService.sendEmail()
    }
}