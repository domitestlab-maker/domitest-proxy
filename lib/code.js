const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateQuoteCode() {
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `DT-${suffix}`;
}
