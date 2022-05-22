import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { TokenService } from "src/token/token.service";
import { Connection, Repository } from "typeorm";
import { CreateVoucherUserDto } from "./dto/create-voucher-user.dto";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { PaymentPointDto } from "./dto/payment-point.dto";
import { VoucherUser } from "./voucher-user.entity";
import { Voucher } from "./voucher.entity";

export class VoucherService {

  constructor(
    // get from entity
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,

    @InjectRepository(VoucherUser)
    private voucherUserRepository: Repository<VoucherUser>,

    @InjectConnection() private readonly connection: Connection,

    private tokenService: TokenService,

  ) { }

  async create(payload: CreateVoucherDto): Promise<Voucher> {
    const { name, description, terms_of_use, thumbnail_url, code, type, provider, provider_id, point_price, expired_at } = payload;
    const user = await this.findOne(name, code);
    console.log(`Payload Create Voucher Name: ${name}`);

    if (user) {
      throw new HttpException(
        `Voucher with Code ${code} Already Issued by ${provider}`,
        HttpStatus.BAD_REQUEST
      );
    }
    const created = await this.voucherRepository.save({
      name,
      description,
      terms_of_use,
      thumbnail_url,
      code,
      type,
      provider,
      provider_id,
      point_price,
      expired_at,
      expired: false,
      created_at: new Date().toISOString()
    });

    return created;
  }

  async createVoucherUser(payload: CreateVoucherUserDto): Promise<VoucherUser> {

    const { voucher_id, user_id, username, payment } = payload;
    let created: any = null;

    await this.claimVoucher(payload).then(async () => {

      const voucherExist = await this.findById(voucher_id);
      if (voucherExist == undefined) {
        throw new HttpException(
          `Voucher Not Found, Cannot Claim Voucher`,
          HttpStatus.BAD_REQUEST
        );
      }

      created = await this.voucherUserRepository.save({
        voucher_id,
        user_id,
        username,
        claimed_at: new Date().toISOString(),
        redeemed: false
      });


    }).catch((err) => {
      throw new HttpException(err.response.message, 500);
    });

    return created;

  }


  async claimVoucher(data: CreateVoucherUserDto) {

    const { voucher_id, username, payment } = data;
    const bumnPoinTokenId = "1";
    const organization = "Org1";

    let totalBUMNPoin: number = 0;

    try {

      const queryResultVoucher = await this.connection.query(`select * from voucher v where v.id = ${voucher_id};`).catch((error) => {
        throw new BadRequestException(`Cannot Execute Query: ${error}`);
      });

      const { point_price, provider_id } = queryResultVoucher[0];

      for (let index = 0; index < data.payment.length; index++) {
        const element = payment[index];

        // BUMN Poin Calculation
        if (element.token_id === parseInt(bumnPoinTokenId)) {
          totalBUMNPoin = totalBUMNPoin + (element.amount * element.exchange_rate);
          continue
        }

        // Exchange Poin to BUMNPoin
        if (element.amount !== 0) {
          // this.tokenService.exchange(username, organization, element.token_id.toString(), bumnPoinTokenId, element.amount.toString()).catch((error) => {
          //   throw new BadRequestException(`Cannot Execute exchange: ${error.responses[0].response.message}`);
          // });
          totalBUMNPoin = totalBUMNPoin + (element.amount * element.exchange_rate);
          continue
        }

      }

      // Get Current BUMN Poin User Balance
      // const userBUMNPoinBalance = await this.tokenService.getClientAccountBalance(username, "Org1", "1").catch((error) => {
      //   throw new BadRequestException(`Cannot Execute getClientAccountBalance: ${error.responses[0].response.message}`);
      // });

      console.log(`Point Price Need: ${point_price} BUMN Poin`);
      console.log(`Total Input Point: ${totalBUMNPoin} BUMN Poin`);


      if (point_price > totalBUMNPoin) {
        throw new BadRequestException(`Your BUMN Poin input price is not enough for this transaction. Required ${point_price} BUMNPoin, Your input ${totalBUMNPoin} BUMNPoin`);
      }

      // if (userBUMNPoinBalance < totalBUMNPoin) {

      //   throw new BadRequestException(`Your BUMN Poin Balance is not enough for this transaction. Required ${point_price}, Your Balance ${userBUMNPoinBalance}`);
      // }

      // Submit Transfer BUMN Token to Merchant
      // this.tokenService.transferTokenFrom(username, "Org1", provider_id, "Org1", "1", totalBUMNPoin.toString()).catch((error) => {
      //   throw new BadRequestException(`Cannot Execute transferTokenFrom: ${error.responses[0].response.message}`);
      // });

      return queryResultVoucher;

    } catch (error) {
      throw new BadRequestException(error);
    }

  }

  async getVouchers() {
    const result = this.voucherRepository.find();
    return result;
  }

  async getUserVouchers(username: string) {
    const queryResult = await this.connection.query(`SELECT * FROM VOUCHER_USER VU LEFT JOIN VOUCHER V ON VU.VOUCHER_ID = V.ID WHERE VU.USERNAME = '${username}' ORDER BY V.EXPIRED_AT ASC;`);
    return queryResult;
  }

  async getUserVoucherDetail(id: number) {
    const baseQuery = `select * from voucher_user vu left join voucher v on vu.voucher_id = v.id where vu.id = '${id}';`
    const queryResult = await this.connection.query(baseQuery);
    return queryResult;
  }

  //find user by username
  async findOne(name: string, code: string): Promise<any> {
    return this.voucherRepository.findOne({ name, code });
  }

  async findById(id: number): Promise<any> {
    return this.voucherRepository.findOne({ id });
    //todo find by id
  }

}