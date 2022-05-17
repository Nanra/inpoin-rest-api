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
  thumbnail_url: string;

  @Column()
  code: string;

  @Column()
  issuer: string;

  @Column()
  point_price: number;

  @Column({ type: 'timestamp', nullable: true })
  expired_at: Date | string;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | string;

}