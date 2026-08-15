import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from 'src/app/user/entities/user.entities';
import { Session } from 'src/app/auth/entities/session.entity';
import { Account } from 'src/app/auth/entities/account.entity';
import { Verification } from 'src/app/auth/entities/verification.entity';
import { Address } from 'src/app/address/entities/address.entity';
import { Category } from 'src/app/category/entities/category.entity';
import { Product } from 'src/app/product/entities/product.entity';
import { ProductImage } from 'src/app/product-image/entities/product-image.entity';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Session,
    Account,
    Verification,
    Address,
    Category,
    Product,
    ProductImage,
  ],
  migrations: ['src/migrations/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: true,
});
