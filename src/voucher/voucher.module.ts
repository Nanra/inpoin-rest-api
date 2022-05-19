import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VoucherUser } from "./voucher-user.entity";
import { VoucherController } from "./voucher.controller";
import { Voucher } from "./voucher.entity";
import { VoucherService } from "./voucher.service";

@Module({
    imports: [TypeOrmModule.forFeature([Voucher, VoucherUser])],
    providers: [VoucherService],
    exports: [VoucherService],
    controllers: [VoucherController]
  })
  export class VoucherModule {}