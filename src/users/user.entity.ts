import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  organization: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column()
  pin: string;

  
}
