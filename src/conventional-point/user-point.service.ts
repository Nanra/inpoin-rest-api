import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserPointDto } from "./dto/create-user-point.dto";
import { UserPoint } from "./user-point.entity";


@Injectable()
export class UserPointService {

    constructor(
        // get from entity
        @InjectRepository(UserPoint)
        private userPointRepository: Repository<UserPoint>,
      ) {}

      //creating a new user, storing user data, finding exixting user
  async create(payload: CreateUserPointDto): Promise<UserPoint> {
    const { username, phone_number, point_name, point_amount } = payload;
    const user = await this.findOne(username, point_name);
    console.log(`Payload Create Point: ${payload.point_amount}`);
    console.log(`Payload Create Point: ${point_amount}`);
    
    if (user) {
      throw new HttpException(
        `Point ${point_name} Already Issued on this User`,
        401,
      );
    }
    const created = await this.userPointRepository.save({
      username,
      phone_number,
      point_name,
      point_amount,
      paired: false
    });

    console.log(`Data Created Point: ${created}`);


    return created;
  }

  async pairing(username: string, phone_number: string, point_name: string) {



  }

  //find user by username
  async findOne(username: string, point_name: string): Promise<any> {
    return this.userPointRepository.findOne({username, point_name});
  }
  async findByPoint(point_name: string): Promise<any> {
    return this.userPointRepository.findOne({ point_name });
  }
  async findById(id: number,): Promise<any> {
    return this.userPointRepository.findOne({ id });
  //todo find by id
  }

}