import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VoucherController } from "./voucher.controller";
import { Voucher } from "./voucher.entity";
import { VoucherService } from "./voucher.service";

@Module({
    imports: [TypeOrmModule.forFeature([Voucher])],
    providers: [VoucherService],
    exports: [VoucherService],
    controllers: [VoucherController]
  })
  export class VoucherModule {}