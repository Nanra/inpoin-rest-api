import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Point {

    @PrimaryGeneratedColumn()
    id: number;

  @Column()
  point_id: string;

  @Column()
  point_name: string;

  @Column()
  point_logo_url: string;

  @Column()
  exchange_rate: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | string;

  @Column({ type: 'timestamp', nullable: true })
  edited_at: Date | string;

}