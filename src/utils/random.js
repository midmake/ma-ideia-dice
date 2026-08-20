export function randomIndex(length) {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('randomIndex requer um tamanho positivo.');
  }

  if (globalThis.crypto?.getRandomValues) {
    const range = 0x100000000;
    const limit = range - (range % length);
    const bucket = new Uint32Array(1);

    do {
      globalThis.crypto.getRandomValues(bucket);
    } while (bucket[0] >= limit);

    return bucket[0] % length;
  }

  return Math.floor(Math.random() * length);
}
