import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtOtpGuard } from "src/auth/jwt-otp.guard";
import { CreateUserPointDto } from "./dto/create-user-point.dto";
import { UserPointService } from "./user-point.service";


class PairPointDto {
    phone_number: string;
    point_name: string;
}

@Controller('point')
export class UserPointController {

    constructor(
        private readonly userPointService: UserPointService
    ) {}


    @UseGuards(JwtOtpGuard)
    @Post('create')
    async createUserPoint(@Body() payload: CreateUserPointDto) {
        return this.userPointService.create(payload);
    }

    @UseGuards(JwtOtpGuard)
    @Post('pair')
    async pairUserPoint(
        @Req() { user: { username } },
        @Body() payload: PairPointDto) {
        return this.userPointService.pairing(username, payload.phone_number, payload.point_name);
    }

    @UseGuards(JwtOtpGuard)
    @Get('balance')
    async getUserPointBalance(
        @Req() { user: { username } }) {
        return this.userPointService.getPointBalance(username);
    }

}