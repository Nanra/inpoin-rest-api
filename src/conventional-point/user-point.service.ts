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
    const { username, phone_number, point_name, paired, paired_at, amount } = payload;

    const existingPoint = await this.findPointByName(point_name);  
    
    if (existingPoint == undefined) {
      throw new HttpException(
        `Point ${point_name} Not Found`,
        HttpStatus.BAD_REQUEST
      );
    }

    console.log("Existing Poin: " + existingPoint.id);

    const issued = await this.findOne(username, existingPoint.id);

    if (issued) {
      throw new HttpException(
        `Point ${point_name} Already Issued to user ${username}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const created = await this.userPointRepository.save({
      username,
      phone_number,
      point_id: existingPoint.id,
      token_id: existingPoint.token_id,
      paired,
      paired_at,
      issued_at:  new Date().toISOString(),
      amount,
      updated_at: new Date().toISOString(),
      token_synced: true
    });

    return created;
  }

  async createPoint(payload: CreatePointDto): Promise<Point> {
    const { token_id, point_name, exchange_rate, min_token_transaction, point_logo_url} = payload;

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
      min_token_transaction,
      created_at: new Date().toISOString()
    });

    console.log(`Data Created Point: ${created}`);

    return created;
  }

  async pairing(username: string, phone_number: string, point_id: number) {

    const pairedPoint = await this.getPairedPoint(username, phone_number, point_id);
    const unpairedPoint = await this.getUnpairedPoint(username, phone_number, point_id);


    if (pairedPoint !== undefined) {
      throw new HttpException(`This Point already paired to user: ${username}`, HttpStatus.BAD_REQUEST);
    }

    if (unpairedPoint === undefined) {
      throw new HttpException('Failed to pairing point. Invalid username, phone number or point name', HttpStatus.BAD_REQUEST);
    }

    console.log("Pairing Service Username: " + username);
    console.log("Poin Query: " + unpairedPoint);
    

    console.log("Point Exist: " + unpairedPoint.username);
    console.log(`Username: ${username}, Phone Number: ${phone_number}, Point ID: ${point_id} `);

    unpairedPoint.paired = true
    unpairedPoint.paired_at =  new Date().toISOString();

    this.userPointRepository.save(unpairedPoint);

    return unpairedPoint;

  }

  async getPointBalance(username: string) {

    let resultSet: UserPointsDto[] = [];

    const queryResult = await this.connection.query(`select up.id, up.username, up.phone_number, up.point_id, up.token_id, up.amount, up.paired, up.paired_at, up.issued_at, up.updated_at, up.token_synced, p.point_name, p.point_logo_url, p.exchange_rate, p.min_token_transaction from user_point up left join point p on up.point_id = p.id where up.username = '${username}' order by up.token_id asc;`);

    for (let index = 0; index < queryResult.length; index++) {
      const element = queryResult[index];
      
      resultSet.push(element);

      if ((element.amount <= 0) && (element.token_synced == false)) {
        console.log(`Point ${element.point_name} dengan ID token ${element.token_id} belum Sinkron dengan Blockchain`);
        const tokenBalance = await this.getClientAccountBalance(username, 'Org1', element.token_id.toString());
        console.log(`On Chain Balance: ${tokenBalance}`);
        
        this.updateClientAccountBalance(username, tokenBalance, element.token_id);
        resultSet[index].amount = tokenBalance;
        console.log(`Success Update User Balance to Off-chain`);
        
      }
      
    }

    return resultSet;
  }

  async getUnpairedPoint(username: string, phone_number: string, point_id: number) {
    const result = this.userPointRepository.findOne({
      where: { username, phone_number, point_id, paired: false }
    });

    return result;
  }

  async getPairedPoint(username: string, phone_number: string, point_id: number) {
    const result = this.userPointRepository.findOne({
      where: { username, phone_number, point_id, paired: true }
    });

    return result;
  }

  async updateClientAccountBalance(username: string, amount: number, token_id: number) {
    const nowDate = new Date().toISOString();
        const queryUpdateBalance = this.connection.query(`update public.user_point set amount = ${amount}, token_synced = true, updated_at = '${nowDate}' where username = '${username}' and token_id = ${token_id};`);
        console.log(`Success Update User Balance off-chain on Synchronized`);
        return queryUpdateBalance;
  }

  async updateClientAccountBalanceExchange(username: string, from_token_amount: number, from_token_id: number, to_token_amount: number, to_token_id: number) {
    const nowDate = new Date().toISOString();
        await this.connection.query(`update public.user_point set amount = (((select up.amount from user_point up where up.username = '${username}' and up.token_id = ${from_token_id})) - ${from_token_amount}), token_synced = true, updated_at = '${nowDate}' where username = '${username}' and token_id = ${from_token_id};`);
        await this.connection.query(`update public.user_point set amount = (((select up.amount from user_point up where up.username = '${username}' and up.token_id = ${to_token_id})) + ${to_token_amount}), token_synced = true, updated_at = '${nowDate}' where username = '${username}' and token_id = ${to_token_id};`);
        console.log(`Success Update User Balance off-chain on Exchange`);
        return `Success Update Exchange Balance`;
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