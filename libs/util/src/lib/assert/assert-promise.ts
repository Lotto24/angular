export function assertPromise(type: any): type is Promise<any> {
  return (
    type.then !== undefined &&
    type.catch !== undefined &&
    type.finally !== undefined
  );
}
