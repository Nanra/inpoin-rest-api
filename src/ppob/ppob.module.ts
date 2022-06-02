import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PPOBService } from './ppob.service';


@Module({
  providers: [PPOBService],
  exports: [PPOBService],
})
export class PPOBModule {}
