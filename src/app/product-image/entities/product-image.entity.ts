import { Product } from 'src/app/product/entities/product.entity';
import { BaseUuidEntity } from 'src/config/database/base-uuid.entities';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
@Index('uq_primary_image_per_product', ['productId'], {
  unique: true,
  where: '"is_primary" = true',
})
export class ProductImage extends BaseUuidEntity {
  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @Column({ type: 'text' })
  imageKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText: string | null;

  @Column({ type: 'smallint', default: 0 })
  displayOrder: number;

  @Column({ default: false })
  isPrimary: boolean;

  // Relations
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
