import { Model } from "./Model";
import { extendClass, asyncForEach, snooze } from "./helpers";
import microtime from 'microtime';

const padding = 35
require('colors')

export class Builder {
  // Dirty hack to remove this:any errors
  [key: string]: any
  // TODO: scope member vars
  static _instances: any;
  methods: {};
  isArray: boolean;
  items: any;
  queue: any[];
  static getInstance(name = 'default') {
    if (!this._instances) {
      this._instances = {}
    }
    if (!this._instances[name]) {
      this._instances[name] = new this()
    }
    return this._instances[name]
  }

  constructor() {
    this.methods = {}
    this.isArray = false
    this.queue = [];
    // Changed call signature
    this.addMethod('convertTo', function (data: object, model: Model, index?: any, items?: any) {
      if (Model === data.constructor) {
        return data
      }
      return new Model(data)
    })
    // Changed call signature
    this.addMethod('toObject', function (model: Model, options: any, index?: any, items?: any) {
      if (model.toObject) {
        return model.toObject(options)
      }
      throw new Error('toObject() requires first element to be of type Model')
    })

    this.addMethod('inspect', function (target: any, index: any, items: any, note = 'Inspect') {
      console.log(note, `[${index}] =>`, target)
      return target
    })

    this.addMethod('intercept', function (target: any, index: any, items: any, callback: Function) {
      return callback(target, index || 0)
    })
  }

  data(data: any) {
    this.isArray = data instanceof Array
    this.items = [].concat(data)
    this.queue = []
    return this
  }

  addMethod(name: string, method: Function) {
    this[name] = function () {
      let args = [].slice.call(arguments)
      this.queue.push({
        method,
        args
      })
      return this
    }
  }
  // Test
  addMethod2(name: string, method: Function) {
    extendClass(Builder.getInstance(), { name: method })
  }

  // Any types until i figure out what should be expected.
  async exec(handler: any) {
    let report: any[] = []
    let startTotalTime = microtime.now()
    let startTime: any;
    let items = this.items
    let item = await asyncForEach(items, async (item: any, index: any) => {
      if (this.queue.length) {
        items[index] = await asyncForEach(this.queue, async (message: any) => {
          if (handler) {
            startTime = microtime.now()
          }
          // Removed brackets from [items]
          let args = [].concat(item, index, items, message.args)
          try {
            await snooze()
            item = await message.method.apply(this, args)
            if (handler) {
              report.push(
                ('item[' + index + '].' + message.method + ': ').padEnd(
                  padding
                ) +
                (microtime.now() - startTime) * 0.001
              )
            }
            return item
          } catch (e) {
            console.log(`ValidationError: ${e.message}`)
            return e
          }
        })
        return items[index]
      }
      return item
    })
    if (handler) {
      report.push(
        'totalTime:'.padEnd(padding) +
        (microtime.now() - startTotalTime) * 0.001 +
        ' ms'
      )
      handler(report.join('\n'))
    }
    if (this.isArray) {
      return this.items
    }
    return item
  }
}
