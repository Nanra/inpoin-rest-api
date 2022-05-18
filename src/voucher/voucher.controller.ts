import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { VoucherService } from "./voucher.service";

@Controller('voucher')
export class VoucherController{

    constructor(
        private readonly voucherService: VoucherService
    ) {}

    @Post('create')
    async createUserPoint(@Body() payload: CreateVoucherDto) {
        return this.voucherService.create(payload);
    }

    @Get()
    async getVouchers() {
        return this.voucherService.getVouchers();
    }

}