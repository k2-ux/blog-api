import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleAuth1747000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Allow password to be null — Google users don't have one
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );

    // Add googleId column for linking Google accounts
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "googleId" character varying UNIQUE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );
  }
}
