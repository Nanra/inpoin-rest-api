import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index
} from 'typeorm';

@Entity()
export class Otp{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  email: string;

  @Column()
  otp_code: string;

  @Column({ type: 'timestamp', nullable: true })
  expired_at: Date;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date | string;

  @Column()
  verified: Boolean;

  
}