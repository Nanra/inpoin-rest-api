import { Module } from '@nestjs/common';
import { OtpService} from './otp.service';
import { UsersModule } from 'src/users/users.module';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './otp.entitiy';
import { EmailModule } from 'src/email/email.module';



@Module({
  imports: [UsersModule, EmailModule, TypeOrmModule.forFeature([Otp])],
  providers: [OtpService],
  exports: [OtpService],
  controllers: [OtpController]
})
export class OtpModule {}