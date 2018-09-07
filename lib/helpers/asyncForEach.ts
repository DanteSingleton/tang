import { snooze } from './snooze';
/**
 * 
 * @param data 
 * @param cb 
 * @param steps 
 */
export async function asyncForEach(data: any, cb: Function, steps: any[] = []) {
  let result: any[] = []

  steps = steps.slice()
  for (let prop in data) {
    if (data.hasOwnProperty(prop)) {
      try {
        await snooze()
        steps.push(prop)
        result = await cb(data[prop], prop, data, steps)
      } catch (e) {
        break
      }
    }
    steps.pop()
  }
  return result
}