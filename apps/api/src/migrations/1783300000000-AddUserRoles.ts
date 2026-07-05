import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRoles1783300000000 implements MigrationInterface {
    name = 'AddUserRoles1783300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" text[] NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
    }

}
