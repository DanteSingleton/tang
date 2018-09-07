// https://jsperf.com/deep-copy-vs-json-stringify-json-parse/51
export default function deepCopyObject (o: any): any {
  let r: any, i, l
  if (typeof o !== 'object') return o
  if (!o) return o
  if (o.constructor === Array) {
    r = []
    l = o.length
    for (i = 0; i < l; i++) r[i] = deepCopyObject(o[i])
    return r
  }
  if (o.constructor === Date) {
    return new Date(o.toISOString())
  }
  if (o.constructor === RegExp) {
    return o
  }
  r = {}
  for (i in o) r[i] = deepCopyObject(o[i])
  return r
}