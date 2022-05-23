import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Point {

    @PrimaryGeneratedColumn()
    id: number;

  @Column()
  point_name: string;

  @Column()
  token_id: number;

  @Column()
  point_logo_url: string;

  @Column()
  exchange_rate: number;

  @Column()
  min_token_transaction: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | string;

  @Column({ type: 'timestamp', nullable: true })
  edited_at: Date | string;

}