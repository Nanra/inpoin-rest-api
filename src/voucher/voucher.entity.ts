import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Voucher {

    @PrimaryGeneratedColumn()
    id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  terms_of_use: string;

  @Column()
  thumbnail_url: string;

  @Column()
  code: string;

  @Column()
  type: string;

  @Column()
  provider: string;

  @Column()
  provider_id: string;

  @Column()
  point_price: number;

  @Column({nullable: true})
  expired: Boolean;

  @Column({ type: 'timestamp', nullable: true })
  expired_at: Date | string;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | string;

}