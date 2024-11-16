import * as argon2 from 'argon2';

export async function hash(str: string): Promise<string> {
  return await argon2.hash(str);
}

export async function verifyHash(hash: string, str: string): Promise<boolean> {
  let isValid = false;

  try {
    isValid = await argon2.verify(hash, str);
  } catch (error: any) {
    console.log({ error });
  }

  return isValid;
}
