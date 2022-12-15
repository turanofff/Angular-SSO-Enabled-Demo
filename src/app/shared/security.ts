/**
 * Encodes base64 into url safe string. I.e.: replacing "+" with "-", "/" with "_" 
 * and removes padding "=" a the end of the base64 string.
 *
 * @param input - base64 string
 * @returns url safe string
 */
export const urlEncodeBase64 = (input: string): string => {
  const base64RemapChars: { [index: string]: string } = { '+': '-', '/': '_', '=': '' };
  return input.replace(/[+/=]/g, (m: string) => base64RemapChars[m]);
};

/**
 * Uses SHA-256 mechanism to hash input string.
 *
 * @param input - string
 * @returns hashed string
 */
export const sha256hash = (input: string): Promise<string> => {
  const buf = new TextEncoder().encode(input);
  return crypto.subtle.digest('SHA-256', buf).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return window.btoa(String.fromCharCode(...hashArray));
  });
};

/**
 * For creating random string of a desired length (default 64 chars).
 *
 * @param length - desired length of string
 * @returns random string
 */
export const createRandomString = (length = 64): string => {
  let random = '';
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const randomValues = Array.from(
    window.crypto.getRandomValues(new Uint8Array(length))
  );
  for (const value of randomValues) {
    random += charset[value % charset.length];
  }
  return random;
};

export const parseJWTpayload = (access_token: string): any => {
  const jwtPayload = access_token.split('.')[1];
  return JSON.parse(decodeURIComponent(atob(jwtPayload)));
}