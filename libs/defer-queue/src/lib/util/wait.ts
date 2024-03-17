export const wait = async (ms: number = 0) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
