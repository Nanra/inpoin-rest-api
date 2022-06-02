import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtOtpGuard } from "src/auth/jwt-otp.guard";
import { ClaimPpobVoucherDto } from "./dto/claim-ppob-voucher.dto";
import { ClaimVoucherDto } from "./dto/claim-voucher.dto";
import { CreatePpobVoucherUserDto } from "./dto/create-ppob-voucher.dto";
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
    async claimVoucher(
        @Req() { user: { userId, username } },
        @Body() payload: ClaimVoucherDto) {
        const payloadVoucherUser = new CreateVoucherUserDto;
        payloadVoucherUser.user_id = userId;
        payloadVoucherUser.username = username;
        payloadVoucherUser.voucher_id = payload.voucher_id;
        payloadVoucherUser.payment = payload.payment;
        return this.voucherService.createVoucherUser(payloadVoucherUser);
    }

    @UseGuards(JwtOtpGuard)
    @Post('claim/ppob')
    async claimVoucherPpob(
        @Req() { user: { userId, username } },
        @Body() payload: ClaimPpobVoucherDto) {
        const payloadVoucherPpobUser = new CreatePpobVoucherUserDto;
        payloadVoucherPpobUser.user_id = userId;
        payloadVoucherPpobUser.username = username;
        payloadVoucherPpobUser.voucher_id = payload.voucher_id;
        payloadVoucherPpobUser.payment = payload.payment;
        payloadVoucherPpobUser.phone_number = payload.phone_number;
        return this.voucherService.createPpobVoucherUser(payloadVoucherPpobUser);
    }

    @UseGuards(JwtOtpGuard)
    @Get()
    async getVouchers() {
        return this.voucherService.getVouchers();
    }

    @UseGuards(JwtOtpGuard)
    @Get('detail')
    async getVoucherDetail(@Query() {idVoucher}) {
        return this.voucherService.getVoucherDetail(idVoucher);
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

    @UseGuards(JwtOtpGuard)
    @Get('/history/user-claim')
    async getUserVoucherHistory(@Req() { user: { username } }) {
        return this.voucherService.getUserVoucherHistory(username);
    }

}