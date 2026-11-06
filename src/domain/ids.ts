/**
 * Generate UUID v4 on HTTPS and insecure LAN HTTP origins.
 * crypto.randomUUID() is secure-context-only in browsers.
 * crypto.getRandomValues() is also available on non-secure origins
 * and provides cryptographically strong random bytes.
 */
export function newId(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID();
  if (typeof cryptoApi?.getRandomValues !== 'function') {
    throw new Error('Não foi possível gerar um identificador seguro neste navegador.');
  }
  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}
