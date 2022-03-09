import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { CoinModule } from './coin/coin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '157.230.39.222',
      port: 5432,
      username: 'inpoin',
      password: 'inpoin123!@#',
      database: 'inpoin_staging',
      entities: [User],
      synchronize: true,
    }),
    AuthModule,
    WalletModule,
    CoinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
