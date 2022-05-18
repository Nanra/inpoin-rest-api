import { Body, Controller, Get, Post, Query } from "@nestjs/common";
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

    @Get('detail')
    async getVoucherDetail(@Query() {idVoucher}) {
        return this.voucherService.findById(idVoucher);
    }

}