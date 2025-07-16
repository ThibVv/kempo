import { Migration } from '@mikro-orm/migrations';

export class AddApprovedToUser extends Migration {

  async up(): Promise<void> {
    this.addSql('ALTER TABLE "user" ADD COLUMN "approved" boolean DEFAULT false;');
  }

  async down(): Promise<void> {
    this.addSql('ALTER TABLE "user" DROP COLUMN "approved";');
  }

}
