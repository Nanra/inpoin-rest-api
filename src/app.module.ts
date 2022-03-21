import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { TokenModule } from './token/token.module';
import { ConfigModule } from '@nestjs/config';
import { OtpModule } from './otp/otp.module';
import { Otp } from './otp/otp.entitiy';
import { EmailModule } from './email/email.module';
import { FabricGatewayModule } from './fabric-gateway/fabric-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '157.230.39.222',
      port: 5432,
      username: 'inpoin',
      password: 'inpoin123!@#',
      database: 'inpoin_staging',
      entities: [User, Otp],
      synchronize: true,
    }),
    FabricGatewayModule,
    AuthModule,
    WalletModule,
    TokenModule,
    OtpModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
