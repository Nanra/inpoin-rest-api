import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class ExchangeTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  from_token_id: number;

  @Column()
  from_token_name: string;

  @Column()
  to_token_id: number;

  @Column()
  to_token_name: string;

  @Column('decimal')
  from_token_amount: number;

  @Column('decimal')
  to_token_amount: number;

  @Column('decimal')
  exchange_rate: number;

  @Column()
  fee_token_id: number;

  @Column()
  fee_token_name: string;

  @Column('decimal')
  fee_amount: number;

  @Column()
  tx_id: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;
}
