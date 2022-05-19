import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtOtpGuard } from "src/auth/jwt-otp.guard";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { VoucherService } from "./voucher.service";

@Controller('voucher')
export class VoucherController{

    constructor(
        private readonly voucherService: VoucherService
    ) {}

    @UseGuards(JwtOtpGuard)
    @Post('create')
    async createUserPoint(@Body() payload: CreateVoucherDto) {
        return this.voucherService.create(payload);
    }

    @UseGuards(JwtOtpGuard)
    @Get()
    async getVouchers() {
        return this.voucherService.getVouchers();
    }

    @UseGuards(JwtOtpGuard)
    @Get('detail')
    async getVoucherDetail(@Query() {idVoucher}) {
        return this.voucherService.findById(idVoucher);
    }

}