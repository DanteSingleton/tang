export function JSONStringify(o: object) {
  let cache: Array<any> = []
  let str = JSON.stringify(o, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return
      }
      // Store value in our collection
      cache.push(value)
    }
    return value
  })
  // cache = ; // Leave for GC
  return str
}