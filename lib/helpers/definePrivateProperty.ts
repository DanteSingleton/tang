export function definePrivateProperty(target: any, key: string, value: any): void {
  Object.defineProperty(target, key, {
    value,
    enumerable: false,
    writable: true
  })
}
export default definePrivateProperty