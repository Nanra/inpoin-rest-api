import { Module } from '@nestjs/common';
import { FabricGatewayModule } from 'src/fabric-gateway/fabric-gateway.module';
import { UsersModule } from 'src/users/users.module';

import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [FabricGatewayModule, UsersModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
