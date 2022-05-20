import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Point } from "./point.entity";
import { UserPointController } from "./user-point.controller";
import { UserPoint } from "./user-point.entity";
import { UserPointService } from "./user-point.service";


@Module({
    imports: [TypeOrmModule.forFeature([Point, UserPoint])],
    providers: [UserPointService],
    exports: [UserPointService],
    controllers: [UserPointController]
  })
  export class UserPointModule {}