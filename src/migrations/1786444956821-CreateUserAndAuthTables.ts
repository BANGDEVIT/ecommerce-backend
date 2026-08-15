import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndAuthTables1786444956821 implements MigrationInterface {
  name = 'CreateUserAndAuthTables1786444956821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'customer', 'unregister')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "email" character varying NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "email_verified_at" TIMESTAMP WITH TIME ZONE, "image" character varying, "phone" character varying, "birthday" TIMESTAMP WITH TIME ZONE, "gender" character varying, "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer', "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6620cd026ee2b231beac7cfe57" ON "user" ("role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_22b81d3ed19a0bffcb660800f4" ON "user" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "token" text NOT NULL, "ip_address" text, "user_agent" text, "user_id" uuid NOT NULL, "userId" uuid, CONSTRAINT "UQ_232f8e85d7633bd6ddfad421696" UNIQUE ("token"), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2223e981900a413ce4ce6386f9" ON "session" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_232f8e85d7633bd6ddfad42169" ON "session" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30e98e8746699fb9af235410af" ON "session" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "account" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "account_id" text NOT NULL, "provider_id" text NOT NULL, "user_id" uuid NOT NULL, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" TIMESTAMP WITH TIME ZONE, "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE, "scope" text, "password" text, "userId" uuid, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efef1e5fdbe318a379c06678c5" ON "account" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4c4acfbdf57f81c65a880439e3" ON "account" ("provider_id", "account_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "verification" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "identifier" text NOT NULL, "value" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_896e5902333fa9991d1733e5ee" ON "verification" ("identifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3158a931b46cbb4ca60a16fd7" ON "verification" ("expires_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" DROP CONSTRAINT "FK_60328bf27019ff5498c4b977421"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3158a931b46cbb4ca60a16fd7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_896e5902333fa9991d1733e5ee"`,
    );
    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c4acfbdf57f81c65a880439e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_efef1e5fdbe318a379c06678c5"`,
    );
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30e98e8746699fb9af235410af"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_232f8e85d7633bd6ddfad42169"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2223e981900a413ce4ce6386f9"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_22b81d3ed19a0bffcb660800f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6620cd026ee2b231beac7cfe57"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
