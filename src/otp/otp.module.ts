import { Module } from '@nestjs/common';
import { OtpService} from './otp.service';
import { UsersModule } from 'src/users/users.module';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './otp.entitiy';
import { User } from 'src/users/user.entity';



@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Otp])],
  providers: [OtpService],
  exports: [OtpService],
  controllers: [OtpController]
})
export class OtpModule {}