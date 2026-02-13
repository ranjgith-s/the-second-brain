import CryptoJS from 'crypto-js';

const SECRET_KEY = 'second-brain-app-secret-key'; // In a real app, this should be user-provided or env var

export const saveEncrypted = (key: string, value: string) => {
  const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
  localStorage.setItem(key, encrypted);
};

export const getDecrypted = (key: string): string | null => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt data for key:', key, error);
    return null;
  }
};
