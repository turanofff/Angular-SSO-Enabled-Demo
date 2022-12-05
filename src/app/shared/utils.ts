export const sha256 = (input:any) => {
  const buf = new TextEncoder().encode(input);
  return crypto.subtle.digest('SHA-256', buf).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}

export const createRandomString = () => {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.';
  let random = '';
  const randomValues = Array.from(
    window.crypto.getRandomValues(new Uint8Array(43))
  );
  randomValues.forEach(v => (random += charset[v % charset.length]));
  return random;
};

