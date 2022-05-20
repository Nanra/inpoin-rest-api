import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtOtpGuard } from "src/auth/jwt-otp.guard";
import { CreateVoucherUserDto } from "./dto/create-voucher-user.dto";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { VoucherService } from "./voucher.service";

@Controller('voucher')
export class VoucherController{

    constructor(
        private readonly voucherService: VoucherService
    ) {}

    @UseGuards(JwtOtpGuard)
    @Post('create')
    async createVoucher(@Body() payload: CreateVoucherDto) {
        return this.voucherService.create(payload);
    }

    @UseGuards(JwtOtpGuard)
    @Post('claim')
    async claimVoucher(@Req() { user: { userId, username } },
    @Query() {voucherId}) {
        const payload = new CreateVoucherUserDto;
        payload.user_id = userId;
        payload.username = username;
        payload.voucher_id = voucherId;
        return this.voucherService.createVoucherUser(payload);
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

    @UseGuards(JwtOtpGuard)
    @Get('user-claim')
    async getUserVouchers(@Req() { user: { username } }) {
        return this.voucherService.getUserVouchers(username);
    }

    @UseGuards(JwtOtpGuard)
    @Get('user-claim/detail')
    async getUserVoucherDetail(@Query() {idUserVoucher}) {
        return this.voucherService.getUserVoucherDetail(idUserVoucher);
    }

}