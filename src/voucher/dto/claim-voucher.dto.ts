import { PaymentPointDto } from "./payment-point.dto";

export class ClaimVoucherDto {
    voucher_id: number;
    payment: PaymentPointDto[];
  }
  