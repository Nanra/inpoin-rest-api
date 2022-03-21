import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FabricGatewayService } from './fabric-gateway.service';

@Module({
  imports: [ConfigModule],
  providers: [FabricGatewayService],
  exports: [FabricGatewayService],
})
export class FabricGatewayModule {}
