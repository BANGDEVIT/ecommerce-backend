import { BaseUuidEntity } from 'src/config/database/base-uuid.entities';
import { UserRole } from 'src/shared/types/user-role.enum';
import { Column, DeleteDateColumn, Entity, Index } from 'typeorm';

@Entity()
export class User extends BaseUuidEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  @Index()
  email: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  birthday: Date | null;

  @Column({ type: 'varchar', nullable: true })
  gender: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  @Index()
  role: UserRole;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true }) // muốn lấy deleted thì thêm with delete
  @Index()
  deletedAt: Date | null;
}
