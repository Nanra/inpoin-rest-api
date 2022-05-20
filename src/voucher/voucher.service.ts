import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import { CreateVoucherUserDto } from "./dto/create-voucher-user.dto";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { VoucherUser } from "./voucher-user.entity";
import { Voucher } from "./voucher.entity";

export class VoucherService{

    constructor(
        // get from entity
        @InjectRepository(Voucher)
        private voucherRepository: Repository<Voucher>,

        @InjectRepository(VoucherUser)
        private voucherUserRepository: Repository<VoucherUser>,

        @InjectConnection() private readonly connection: Connection,
      ) {}

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
        const { voucher_id, user_id, username } = payload;
        const user = await this.findById(voucher_id);
        if (user == undefined) {
          throw new HttpException(
            `Voucher Not Found, Cannot Claim Voucher`,
            HttpStatus.BAD_REQUEST
          );
        }

        const created = await this.voucherUserRepository.save({
          voucher_id,
          user_id,
          username,
          claimed_at: new Date().toISOString(),
          redeemed: false
        });

        return created;
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
    return this.voucherRepository.findOne({name, code});
  }
  
  async findById(id: number): Promise<any> {
    return this.voucherRepository.findOne({ id });
  //todo find by id
  }

}