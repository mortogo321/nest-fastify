import { Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

const logger = new Logger('EncryptionUtils');

export async function hash(str: string): Promise<string> {
  return await argon2.hash(str);
}

export async function verifyHash(hash: string, str: string): Promise<boolean> {
  let isValid = false;

  try {
    isValid = await argon2.verify(hash, str);
  } catch (error: any) {
    logger.error('Hash verification failed', error?.message || error);
  }

  return isValid;
}
