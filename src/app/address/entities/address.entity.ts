import { User } from 'src/app/user/entities/user.entities';
import { BaseUuidEntity } from 'src/config/database/base-uuid.entities';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
@Index('user_default_address', ['userId'], {
  unique: true,
  where: '"is_default" = true AND "deleted_at" IS NULL',
})
export class Address extends BaseUuidEntity {
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  addressLine1: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  addressLine2: string | null;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  ward: string;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  postalCode: string | null;

  @Column({ type: 'boolean', default: false })
  @Index()
  isDefault: boolean;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  @Index()
  deletedAt: Date | null;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
