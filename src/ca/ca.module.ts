import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CaService } from './ca.service';

@Module({
  imports: [ConfigModule],
  providers: [CaService],
  exports: [CaService],
})
export class CaModule {}
