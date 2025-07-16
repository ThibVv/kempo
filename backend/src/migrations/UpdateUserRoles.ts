import { Migration } from '@mikro-orm/migrations';

export class UpdateUserRoles extends Migration {

  async up(): Promise<void> {
    // Mettre à jour la table users pour avoir les nouveaux rôles
    this.addSql('ALTER TABLE users MODIFY role VARCHAR(255) DEFAULT \'user\';');
    
    // Optionnel: mettre à jour les anciens rôles 'admin' vers 'club_admin'
    this.addSql('UPDATE users SET role = \'club_admin\' WHERE role = \'admin\';');
  }

  async down(): Promise<void> {
    // Revenir aux anciens rôles si nécessaire
    this.addSql('UPDATE users SET role = \'admin\' WHERE role = \'club_admin\' OR role = \'super_admin\';');
  }

}
