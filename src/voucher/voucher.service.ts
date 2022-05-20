import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
        private voucherUserRepository: Repository<VoucherUser>
      ) {}

      async create(payload: CreateVoucherDto): Promise<Voucher> {
        const { name, description, thumbnail_url, code, type, provider, provider_id, point_price, expired_at } = payload;
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
          thumbnail_url,
          code,
          type,
          provider,
          provider_id,
          point_price,
          expired_at,
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

        const {name, point_price, code, provider, thumbnail_url } = user;

        const created = await this.voucherUserRepository.save({
          voucher_id,
          voucher_name: name,
          voucher_price: point_price,
          voucher_code: code,
          voucher_provider: provider,
          voucher_thumbnail: thumbnail_url,
          user_id,
          username,
          claimed_at: new Date().toISOString()
        });

        return created;
      }

      async getVouchers() {
        const result = this.voucherRepository.find();
        return result;
      }

      async getUserVouchers(username: string) {
        const result = this.voucherUserRepository.find({
          where: { username},
        });
        return result;
      }

      async getUserVoucherDetail(id: number) {
        const result = this.voucherUserRepository.findOne({id});
        return result;
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