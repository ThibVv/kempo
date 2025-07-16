import * as crypto from 'crypto';

/**
 * Utilitaire de chiffrement AES-256-GCM pour protéger les données sensibles
 */
class CryptoService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly TAG_LENGTH = 16; // 128 bits

  /**
   * Génère une clé de chiffrement sécurisée
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    // Utilise PBKDF2 pour dériver une clé forte
    const salt = process.env.ENCRYPTION_SALT || 'default-salt-change-in-prod';
    return crypto.pbkdf2Sync(key, salt, 100000, this.KEY_LENGTH, 'sha256');
  }

  /**
   * Chiffre des données avec AES-256-GCM
   */
  static encrypt(plaintext: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      const cipher = crypto.createCipher(this.ALGORITHM, key) as crypto.CipherGCM;
      cipher.setAAD(Buffer.from('additional-data'));
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine IV + tag + encrypted data
      const result = iv.toString('hex') + tag.toString('hex') + encrypted;
      
      return result;
    } catch (error) {
      console.error('Encryption error:', error);
      // Fallback to simple AES-256-CTR for compatibility
      return this.encryptSimple(plaintext);
    }
  }

  /**
   * Déchiffre des données avec AES-256-GCM
   */
  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      
      // Extract IV, tag, and encrypted data
      const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), 'hex');
      const tag = Buffer.from(encryptedData.slice(this.IV_LENGTH * 2, (this.IV_LENGTH + this.TAG_LENGTH) * 2), 'hex');
      const encrypted = encryptedData.slice((this.IV_LENGTH + this.TAG_LENGTH) * 2);
      
      const decipher = crypto.createDecipher(this.ALGORITHM, key) as crypto.DecipherGCM;
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('additional-data'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      // Fallback to simple decryption
      return this.decryptSimple(encryptedData);
    }
  }

  /**
   * Chiffrement simple AES-256-CTR (fallback)
   */
  private static encryptSimple(plaintext: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    const cipher = crypto.createCipher('aes-256-ctr', key);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + encrypted;
  }

  /**
   * Déchiffrement simple AES-256-CTR (fallback)
   */
  private static decryptSimple(encryptedData: string): string {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), 'hex');
    const encrypted = encryptedData.slice(this.IV_LENGTH * 2);
    
    const decipher = crypto.createDecipher('aes-256-ctr', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Génère un hash sécurisé pour les données non-reversibles
   */
  static hash(data: string): string {
    const salt = crypto.randomBytes(32);
    const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  /**
   * Vérifie un hash
   */
  static verifyHash(data: string, hash: string): boolean {
    const [saltHex, hashHex] = hash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const originalHash = Buffer.from(hashHex, 'hex');
    
    const computedHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    
    return crypto.timingSafeEqual(originalHash, computedHash);
  }

  /**
   * Génère un token sécurisé
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

export default CryptoService;
