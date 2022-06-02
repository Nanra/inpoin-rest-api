import { PaymentPointDto } from "./payment-point.dto";

export class CreatePpobVoucherUserDto {
    voucher_id: number;
    user_id: number;
    username: string;
    phone_number: string;
    payment: PaymentPointDto[];
  }
  