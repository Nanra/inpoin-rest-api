import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenModule } from "src/token/token.module";
import { VoucherUser } from "./voucher-user.entity";
import { VoucherController } from "./voucher.controller";
import { Voucher } from "./voucher.entity";
import { VoucherService } from "./voucher.service";

@Module({
    imports: [
      TokenModule,
      TypeOrmModule.forFeature([Voucher, VoucherUser])],
    providers: [VoucherService],
    exports: [VoucherService],
    controllers: [VoucherController]
  })
  export class VoucherModule {}