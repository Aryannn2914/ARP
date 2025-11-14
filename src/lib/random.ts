export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const r = (typeof crypto !== "undefined" && "getRandomValues" in crypto)
      ? crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
      : Math.floor(Math.random() * (i + 1));
    [a[i], a[r]] = [a[r], a[i]];
  }
  return a;
}
export function sampleUnique<T>(pool: T[], n: number): T[] {
  if (!Array.isArray(pool) || n <= 0) return [];
  if (n >= pool.length) return shuffle(pool);
  return shuffle(pool).slice(0, n);
}
