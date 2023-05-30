export async function delay(millis: number): Promise<void> {
  return await new Promise(resolve => setTimeout(resolve, millis));
}
