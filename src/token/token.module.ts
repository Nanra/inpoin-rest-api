import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricGatewayModule } from 'src/fabric-gateway/fabric-gateway.module';
import { UsersModule } from 'src/users/users.module';
import { ExchangeTransaction } from './echange-transaction.entity';

import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [
    FabricGatewayModule,
    UsersModule,
    TypeOrmModule.forFeature([ExchangeTransaction]),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
