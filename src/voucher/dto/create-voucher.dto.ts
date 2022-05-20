export class CreateVoucherDto {
    name: string;
    description: string;
    terms_of_use: string;
    code: string;
    type: string;
    provider: string;
    provider_id: string;
    point_price: number;
    thumbnail_url: string;
    expired_at: string
  }
  