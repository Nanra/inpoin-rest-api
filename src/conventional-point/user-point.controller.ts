import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserPointDto } from "./dto/create-user-point.dto";
import { UserPointService } from "./user-point.service";

@Controller('point')
export class UserPointController {

    constructor(
        private readonly userPointService: UserPointService
    ) {}


    @Post('create')
    async createUserPoint(@Body() payload: CreateUserPointDto) {
        return this.userPointService.create(payload);
    }

}