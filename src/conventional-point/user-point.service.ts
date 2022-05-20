import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { FabricGatewayService } from "src/fabric-gateway/fabric-gateway.service";
import { Connection, Repository } from "typeorm";
import { CreatePointDto } from "./dto/create-point.dto";
import { CreateUserPointDto } from "./dto/create-user-point.dto";
import { UserPointsDto } from "./dto/list-user-point.dto";
import { Point } from "./point.entity";
import { UserPoint } from "./user-point.entity";

const CHANNEL_NAME = 'inpoinchannel';
const CHAINCODE_ID = 'lp';

@Injectable()
export class UserPointService {

    constructor(
        // get from entity
        @InjectRepository(UserPoint)
        private userPointRepository: Repository<UserPoint>,

        @InjectRepository(Point)
        private pointRepository: Repository<Point>,

        @InjectConnection() private readonly connection: Connection,

        private fabricGatewayService: FabricGatewayService,
      ) {}

      //creating a new user, storing user data, finding exixting user
  async createUserPoint(payload: CreateUserPointDto): Promise<UserPoint> {
    const { username, phone_number, point_name } = payload;

    const existingPoint = await this.findPointByName(point_name);  
    
    if (existingPoint == undefined) {
      throw new HttpException(
        `Point ${point_name} Not Found`,
        HttpStatus.BAD_REQUEST
      );
    }

    console.log("Existing Poin: " + existingPoint.id);

    const issued = await this.findByPoint(existingPoint.id);

    if (issued) {
      throw new HttpException(
        `Point ${point_name} Already Issued to this User`,
        HttpStatus.BAD_REQUEST
      );
    }

    const created = await this.userPointRepository.save({
      username,
      phone_number,
      point_id: existingPoint.id,
      token_id: existingPoint.token_id,
      paired: false,
      issued_at:  new Date().toISOString()
    });

    return created;
  }

  async createPoint(payload: CreatePointDto): Promise<Point> {
    const { token_id, point_name, exchange_rate, point_logo_url} = payload;

    const pointExist = await this.findPointByTokenId(token_id);
    // console.log(`Payload Create Point: ${point_amount}`);
    
    if (pointExist) {
      throw new HttpException(
        `Point ${point_name} Already Issued`,
        HttpStatus.BAD_REQUEST
      );
    }
    const created = await this.pointRepository.save({
      token_id,
      point_name,
      point_logo_url,
      exchange_rate,
      created_at: new Date().toISOString()
    });

    console.log(`Data Created Point: ${created}`);

    return created;
  }

  async pairing(username: string, phone_number: string, point_id: number) {

    const point = await this.getUnpairedPoint(username, phone_number, point_id);

    console.log("Point Exist: " + point.username);
    console.log(`Username: ${username}, Phone Number: ${phone_number}, Point ID: ${point_id} `);
    

    if (point == undefined) {
      throw new HttpException('Failed to pairing point, invalid username, phone number or point name', HttpStatus.BAD_REQUEST);
    }

    point.paired = true
    point.paired_at =  new Date().toISOString();

    this.userPointRepository.save(point);

    return point;

  }

  async getPointBalance(username: string) {

    let resultSet: UserPointsDto[] = [];

    const allResult = await this.connection.query('SELECT UP.ID, UP.USERNAME, UP.POINT_ID, UP.TOKEN_ID, UP.PAIRED, UP.PAIRED_AT, UP.ISSUED_AT, P.POINT_NAME, P.POINT_LOGO_URL, P.EXCHANGE_RATE FROM USER_POINT UP LEFT JOIN POINT P ON UP.POINT_ID = P.ID;');


    for (let index = 0; index < allResult.length; index++) {
      const element = allResult[index];

      resultSet.push(element);
      console.log(`Usernamer: ${element.username} , Token ID: ${element.token_id.toString()}`);
      
      resultSet[index].amount = await this.getClientAccountBalance(element.username, 'Org1', element.token_id.toString());
      
    }

    console.log("Final Resultset: " + resultSet[0].token_id);
    
    return resultSet;
  }

  async getUnpairedPoint(username: string, phone_number: string, point_id: number) {
    const result = this.userPointRepository.findOne({
      where: { username, phone_number, point_id, paired: false }
    });

    return result;
  }


  // Fabric Method
  async getClientAccountBalance(
    username: string,
    organization: string,
    tokenId: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);

    const args = [tokenId];
    const transactionName = 'ClientAccountBalance';

    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    const result = submitResult.toString('utf-8');

    return Number(result);
  }

  //find user by username
  async findOne(username: string, point_id: number): Promise<any> {
    return this.userPointRepository.findOne({username, point_id});
  }

  async findByPoint(point_id: number): Promise<any> {
    return this.userPointRepository.findOne({ point_id });
  }

  async findById(id: number,): Promise<any> {
    return this.userPointRepository.findOne({ id });
  //todo find by id
  }

  async findPointByTokenId(token_id: number,): Promise<any> {
    return this.pointRepository.findOne({ token_id });
  //todo find by id
  }

  async findPointByName(point_name: string,): Promise<any> {
    return this.pointRepository.findOne({ point_name });
  //todo find by id
  }

}