

export class RedeemHistoryDto {
    username: string;
    from_token_id: number;
    from_token_name: string;
    to_token_id: number;
    to_token_name: string;
    from_token_amount: number;
    to_token_amount: number;
    tx_type: string;
  }