import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTable1786458802318 implements MigrationInterface {
  name = 'CreateProductTable1786458802318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "category_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "short_description" text, "description" text, "price" numeric(12,2) NOT NULL, "compare_at_price" numeric(12,2), "stock_quantity" integer NOT NULL DEFAULT '0', "sku" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "is_featured" boolean NOT NULL DEFAULT false, "view_count" integer NOT NULL DEFAULT '0', "rating_average" numeric(3,2) NOT NULL DEFAULT '0', "review_count" integer NOT NULL DEFAULT '0', "has_variants" boolean NOT NULL DEFAULT false, "weight" numeric(12,2), "deleted_at" TIMESTAMP WITH TIME ZONE, "categoryId" uuid, CONSTRAINT "UQ_8cfaf4a1e80806d58e3dbe69224" UNIQUE ("slug"), CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0dce9bc93c2d2c399982d04bef" ON "product" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a433eeca0a34c58b5ac80a6a08" ON "product" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66066600c02e85707cc0d1ec7a" ON "product" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_featured" ON "product" ("is_featured") WHERE "is_featured" = true AND "is_active" = true AND "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_product_featured"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66066600c02e85707cc0d1ec7a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a433eeca0a34c58b5ac80a6a08"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0dce9bc93c2d2c399982d04bef"`,
    );
    await queryRunner.query(`DROP TABLE "product"`);
  }
}
