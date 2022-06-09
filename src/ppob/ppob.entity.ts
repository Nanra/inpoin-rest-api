import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TransactionPPOB {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_trx: string;

  @Column()
  destNumber: string;

  @Column()
  amount: string;

  @Column({ nullable: true })
  isSuccess: boolean;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | string;
}
