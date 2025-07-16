import { Migration } from '@mikro-orm/migrations';

export class Migration20250714204500 extends Migration {

  async up(): Promise<void> {
    this.addSql('ALTER TABLE `tournament` ADD COLUMN `created_by` INT NOT NULL DEFAULT 1;');
  }

  async down(): Promise<void> {
    this.addSql('ALTER TABLE `tournament` DROP COLUMN `created_by`;');
  }

}
