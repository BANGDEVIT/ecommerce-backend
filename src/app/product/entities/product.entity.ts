import { Category } from 'src/app/category/entities/category.entity';
import { BaseUuidEntity } from 'src/config/database/base-uuid.entities';
import {
  decimalColumn,
  decimalColumnTransformer,
  nullableDecimalColumn,
} from 'src/shared/utils/decimal-column.transformer';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
@Index('idx_product_featured', ['isFeatured'], {
  where: '"is_featured" = true AND "is_active" = true AND "deleted_at" IS NULL',
})
export class Product extends BaseUuidEntity {
  @Column({ type: 'uuid' })
  @Index()
  categoryId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column(decimalColumn)
  price: number; // Base price or single price

  @Column(nullableDecimalColumn)
  compareAtPrice: number | null;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number; // For non-variant products

  @Column({ type: 'varchar', length: 100, unique: true }) // Stock Keeping Unit mã quản lý hàng hóa/sản phẩm.
  sku: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  ratingAverage: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'boolean', default: false })
  hasVariants: boolean;

  @Column(nullableDecimalColumn)
  weight: number | null; // Grams — fallback when no variant weight

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  @Index()
  deletedAt: Date | null;

  // Relations
  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
