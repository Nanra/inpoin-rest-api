import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserPoint {

    @PrimaryGeneratedColumn()
    id: number;

  @Column()
  username: string;

  @Column()
  phone_number: string;

  @Column()
  point_name: string;

  @Column({ nullable: false })
  point_amount: number;

  @Column()
  paired: Boolean;

  @Column({ type: 'timestamp', nullable: true })
  paired_at: Date | string;

}