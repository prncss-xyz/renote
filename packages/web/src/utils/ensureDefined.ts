export function ensureDefined<T>(x: T | undefined): T {
  if (x === undefined) throw new Error("should not be undefined");
  return x;
}
