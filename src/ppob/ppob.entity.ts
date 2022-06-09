import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TransactionPPOB {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  trans_id: number;

  @Column()
  dest_number: number;

  @Column()
  amount: number;

  @Column()
  is_success: boolean;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | string;
}
