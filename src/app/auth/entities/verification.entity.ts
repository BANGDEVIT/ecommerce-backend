import { BaseUuidEntity } from 'src/config/database/base-uuid.entities';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Verification extends BaseUuidEntity {
  @Column({ type: 'text' })
  @Index()
  identifier: string;

  @Column({ type: 'text' })
  @Index()
  value: string;

  @Column({ type: 'timestamptz' })
  @Index()
  expiresAt: Date;
}
