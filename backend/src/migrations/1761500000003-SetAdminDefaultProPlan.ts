import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetAdminDefaultProPlan1761500000003 implements MigrationInterface {
  name = 'SetAdminDefaultProPlan1761500000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users"
      SET "plan" = 'pro', "updatedAt" = now()
      WHERE "email" = 'admin@default.com'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users"
      SET "plan" = 'free', "updatedAt" = now()
      WHERE "email" = 'admin@default.com'
    `);
  }
}
