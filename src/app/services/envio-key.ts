// Keep the same key when a request is retried after a network error.
const chaves = new WeakMap<object, string>();
export function novaChaveEnvio(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // getRandomValues also works when testing from an HTTP address on the local network.
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
}
export function chaveEnvio(objeto: object): string {
  let chave = chaves.get(objeto);
  if (!chave) { chave = novaChaveEnvio(); chaves.set(objeto, chave); }
  return chave;
}
