import { BaseUuidEntity } from 'src/config/database/base-uuid.entities';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Category extends BaseUuidEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  imageKey: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'smallint', default: 0 })
  displayOrder: number;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentId: string | null;

  // Relations
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
