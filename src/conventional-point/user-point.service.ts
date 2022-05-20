import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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
    const { username, phone_number, point_id, point_name, point_amount } = payload;
    const user = await this.findOne(username, point_id);
    console.log(`Payload Create Point: ${point_amount}`);
    
    if (user) {
      throw new HttpException(
        `Point ${point_name} Already Issued on this User`,
        HttpStatus.BAD_REQUEST
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

    const point = await this.getUnpairedPoint(username, phone_number, point_name);

    if (point == null) {
      throw new HttpException('Failed to pairing point, invalid username, phone number or point name', HttpStatus.BAD_REQUEST);
    }

    point.paired = true
    point.paired_at =  new Date().toISOString();

    this.userPointRepository.save(point);

    return point;

  }


  async getPointBalance(username: string) {
    const result = this.userPointRepository.find({
      where: { username, paired: true },
    });

    return result;
  }

  async getUnpairedPoint(username: string, phone_number: string, point_name: string) {
    const result = this.userPointRepository.findOne({
      where: { username, phone_number, point_name, paired: false },
    });

    return result;
  }

  //find user by username
  async findOne(username: string, point_id: string): Promise<any> {
    return this.userPointRepository.findOne({username, point_id});
  }
  async findByPoint(point_id: string): Promise<any> {
    return this.userPointRepository.findOne({ point_id });
  }
  async findById(id: number,): Promise<any> {
    return this.userPointRepository.findOne({ id });
  //todo find by id
  }

}