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
import { ExchangeTransaction } from './token/echange-transaction.entity';
import { UserPoint } from './conventional-point/user-point.entity';
import { UserPointModule } from './conventional-point/user-point.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'inpoinudev',
      password: 'inpoinsecret',
      database: 'inpoin_dev',
      entities: [User, Otp, ExchangeTransaction, UserPoint],
      synchronize: true,
    }),
    FabricGatewayModule,
    AuthModule,
    WalletModule,
    TokenModule,
    OtpModule,
    EmailModule,
    UserPointModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
