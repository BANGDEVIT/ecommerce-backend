import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryTable1786454181878 implements MigrationInterface {
  name = 'CreateCategoryTable1786454181878';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "description" text, "image_key" text, "slug" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "display_order" smallint NOT NULL DEFAULT '0', "deleted_at" TIMESTAMP WITH TIME ZONE, "parent_id" uuid, "parentId" uuid, CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1117b4fcb3cd4abb4383e1c274" ON "category" ("parent_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1117b4fcb3cd4abb4383e1c274"`,
    );
    await queryRunner.query(`DROP TABLE "category"`);
  }
}
