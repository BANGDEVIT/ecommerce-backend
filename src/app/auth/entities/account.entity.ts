import { User } from 'src/app/user/entities/user.entities';
import { BaseUuidEntity } from 'src/config/database/base-uuid.entities';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
@Index(['providerId', 'accountId'], { unique: true })
export class Account extends BaseUuidEntity {
  @Column({ type: 'text' })
  accountId: string;

  @Column({ type: 'text' })
  providerId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'text', nullable: true }) // cho phép app sử dụng một vài API của Provider(như google) cho phép làm gì đó
  accessToken: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'text', nullable: true }) // để provider xác thực bạn là ai và đăng nhập chứa
  idToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  accessTokenExpiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  refreshTokenExpiresAt: Date | null;

  @Column({ type: 'text', nullable: true })
  scope: string | null;

  @Column({ type: 'text', nullable: true })
  password: string | null;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
