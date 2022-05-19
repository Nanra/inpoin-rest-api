import { User } from "src/users/user.entity";
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Voucher } from "./voucher.entity";

@Entity()
export class VoucherUser {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    voucher_id: number;

    @Column()
    voucher_name: string;

    @Column()
    voucher_price: string;

    @Column()
    voucher_code: string;

    @Column()
    voucher_provider: string;

    @Column()
    voucher_thumbnail: string;

    @Column()
    user_id: number;

    @Column()
    username: string;

    @Column({ type: 'timestamp', nullable: true })
    claimed_at: Date | string;
    
    @Column({nullable: true})
    redeemed: Boolean;
    
    @Column({ type: 'timestamp', nullable: true })
    redeemed_at: Date | string;

    @Column({nullable: true})
    expired: Boolean;

    @Column({ type: 'timestamp', nullable: true })
    expired_at: Date | string;

}