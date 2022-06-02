import { PaymentPointDto } from "./payment-point.dto";

export class ClaimPpobVoucherDto {
    voucher_id: number;
    phone_number: string;
    payment: PaymentPointDto[];
  }
  