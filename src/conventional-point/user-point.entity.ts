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
  point_id: number;

  @Column()
  token_id: number;

  @Column()
  paired: Boolean;

  @Column({ type: 'timestamp', nullable: true })
  paired_at: Date | string;

  @Column({ type: 'timestamp', nullable: true })
  issued_at: Date | string;

}