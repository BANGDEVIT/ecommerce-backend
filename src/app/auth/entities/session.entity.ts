import { User } from 'src/app/user/entities/user.entities';
import { BaseUuidEntity } from 'src/config/database/base-uuid.entities';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Session extends BaseUuidEntity {
  @Column({ type: 'timestamptz' })
  @Index()
  expiresAt: Date;

  @Column({ type: 'text', unique: true })
  @Index()
  token: string;

  @Column({ type: 'text', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
