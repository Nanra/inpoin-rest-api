import { PaymentPointDto } from "./payment-point.dto";

export class CreateVoucherUserDto {
    voucher_id: number;
    user_id: number;
    username: string;
    payment: PaymentPointDto[];
  }
  