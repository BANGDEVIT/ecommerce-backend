import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAddressTable1786451911788 implements MigrationInterface {
  name = 'CreateAddressTable1786451911788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "address" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "full_name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "address_line1" character varying(100) NOT NULL, "address_line2" character varying(100), "city" character varying(100) NOT NULL, "district" character varying(100) NOT NULL, "ward" character varying(100) NOT NULL, "postal_code" character varying(20), "is_default" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, "userId" uuid, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_35cd6c3fafec0bb5d072e24ea2" ON "address" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_84f931e0dde2d3242d3fc0cd8a" ON "address" ("is_default") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_355355cdf7cd72329ad9af6116" ON "address" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "user_default_address" ON "address" ("user_id") WHERE "is_default" = true AND "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "address" ADD CONSTRAINT "FK_d25f1ea79e282cc8a42bd616aa3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "address" DROP CONSTRAINT "FK_d25f1ea79e282cc8a42bd616aa3"`,
    );
    await queryRunner.query(`DROP INDEX "public"."user_default_address"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_355355cdf7cd72329ad9af6116"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_84f931e0dde2d3242d3fc0cd8a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_35cd6c3fafec0bb5d072e24ea2"`,
    );
    await queryRunner.query(`DROP TABLE "address"`);
  }
}
