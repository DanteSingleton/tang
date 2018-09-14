/**
 * https: //gist.github.com/Yimiprod/7ee176597fef230d1451
 */
import { transform, isEqual, isObject } from 'lodash';

interface Base {
  [index: string]: any
}
/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function difference(object: object, base: Base): object {
  return transform(object, (result: any, value: any, key: any) => {
    if (!isEqual(value, base[key])) {
      result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
    }
  });
}
export default difference