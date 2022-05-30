import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserPointModule } from "src/conventional-point/user-point.module";
import { TokenModule } from "src/token/token.module";
import { VoucherUser } from "./voucher-user.entity";
import { VoucherController } from "./voucher.controller";
import { Voucher } from "./voucher.entity";
import { VoucherService } from "./voucher.service";

@Module({
    imports: [
      TokenModule,
      UserPointModule,
      TypeOrmModule.forFeature([Voucher, VoucherUser])],
    providers: [VoucherService],
    exports: [VoucherService],
    controllers: [VoucherController]
  })
  export class VoucherModule {}