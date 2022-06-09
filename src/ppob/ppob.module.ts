import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PPOBService } from './ppob.service';
import { TransactionPPOB } from './ppob.entity'


@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionPPOB])
  ],
  providers: [PPOBService],
  exports: [PPOBService],
})
export class PPOBModule { }
