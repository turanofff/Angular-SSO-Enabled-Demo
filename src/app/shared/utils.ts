export const urlEncodeB64 = (input: string) => {
  const b64Chars: { [index: string]: string } = { '+': '-', '/': '_', '=': '.' };
  return input.replace(/[+/=]/g, (m: string) => b64Chars[m]);
};


export const sha256 = (input:any) => {
  const buf = new TextEncoder().encode(input);
  return crypto.subtle.digest('SHA-256', buf).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return window.btoa(String.fromCharCode(...hashArray));
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

