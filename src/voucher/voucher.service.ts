import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { Voucher } from "./voucher.entity";

export class VoucherService{

    constructor(
        // get from entity
        @InjectRepository(Voucher)
        private voucherRepository: Repository<Voucher>,
      ) {}

      async create(payload: CreateVoucherDto): Promise<Voucher> {
        const { name, description, thumbnail_url, code, provider, point_price, expired_at } = payload;
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
          provider,
          point_price,
          expired_at,
          created_at: new Date().toISOString()
        });

        return created;
      }

      async getVouchers() {
        const result = this.voucherRepository.find();
        return result;
      }


      //find user by username
  async findOne(name: string, code: string): Promise<any> {
    return this.voucherRepository.findOne({name, code});
  }
  
  async findById(id: number,): Promise<any> {
    return this.voucherRepository.findOne({ id });
  //todo find by id
  }

}