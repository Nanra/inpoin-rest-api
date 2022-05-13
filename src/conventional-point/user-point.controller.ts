import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateUserPointDto } from "./dto/create-user-point.dto";
import { UserPointService } from "./user-point.service";


class PairPointDto {
    username: string;
    phone_number: string;
    point_name: string;
}

@Controller('point')
export class UserPointController {

    constructor(
        private readonly userPointService: UserPointService
    ) {}


    @Post('create')
    async createUserPoint(@Body() payload: CreateUserPointDto) {
        return this.userPointService.create(payload);
    }

    @Post('pair')
    async pairUserPoint(@Body() payload: PairPointDto) {
        return this.userPointService.pairing(payload.username, payload.phone_number, payload.point_name);
    }

    @Get('balance')
    async getUserPointBalance(@Query() {username}) {
        return this.userPointService.getPointBalance(username);
    }

}