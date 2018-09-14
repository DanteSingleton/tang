import { Schema } from "./Schema";
import clone from './helpers/clone';
import definePrivateProperty from './helpers/definePrivateProperty';
import EventEmitter from 'events';
import { JSONStringify } from './helpers/JSONStringify';

export enum Events {
  emit = "emit",
  off = "off",
  on = "on",
  once = "once",
  keys = "keys"
}
export interface ModelOptions {
  computed?: {},
  validation?: any
}
interface ModelToObjectOptions {
  computed: {},
  skipValidation: any
}
interface ModelValidateOptions {

}
const eventMethods: string[] = ['emit', 'off', 'on', 'once']
let eventEmitter = new EventEmitter()

export interface IDataObject {
  [key: string]: any
}
export class Model {
  // name: string
  isModel: boolean
  _dataSource: any;
  _schema: any;
  _options: any;
  [index: string]: any;
  static emit(...args: any[]) {
    args = [].slice.call(args)
    args[0] = this.name + ':' + args[0]
    eventEmitter[Events.emit].apply(eventEmitter, args)
  }
  static off(...args: any[]) {
    args = [].slice.call(args)
    args[0] = this.name + ':' + args[0]
    eventEmitter[Events.off].apply(eventEmitter, args)
  }
  static on(...args: any[]) {
    args = [].slice.call(args)
    args[0] = this.name + ':' + args[0]
    eventEmitter[Events.on].apply(eventEmitter, args)
  }
  static once(...args: any[]) {
    args = [].slice.call(args)
    args[0] = this.name + ':' + args[0]
    eventEmitter[Events.once].apply(eventEmitter, args)
  }
  /**
   * @param { Object } input - the incoming data to validate
   */
  constructor(data: IDataObject, schema?: Schema, options = {}) {
    // this.name = data.name
    this.isModel = true
    if (schema) {
      schema = new Schema(schema)

      // keep origin data source
      this.isModel = true
      this._dataSource = data
      this._schema = schema
      this._options = options

      // set properties in instance
      Object.assign(this, data)

      // assign computed properties to prototype
      for (let key in schema.computed) {
        Object.defineProperty(this, key, {
          // @ts-ignore
          get: () => schema.computed[key]
        })// tslint:disable-line
      }

      // assign schema methods
      let self = this
      for (let key in schema.methods) {

        definePrivateProperty(this, key, function () {
          // @ts-ignore
          return schema.methods[key].apply(self, arguments)
        })
      }
    }

  }

  emit(...args: any[]) {
    args = [].slice.call(args)
    args[0] = this.constructor.name + ':' + args[0]
    eventEmitter[Events.emit].apply(eventEmitter, args)
  }
  off(...args: any[]) {
    args = [].slice.call(args)
    args[0] = this.constructor.name + ':' + args[0]
    eventEmitter[Events.off].apply(eventEmitter, args)
  }
  on(...args: any[]) {
    args = [].slice.call(args)
    args[0] = this.constructor.name + ':' + args[0]
    eventEmitter[Events.on].apply(eventEmitter, args)
  }
  once(...args: any[]) {
    args = [].slice.call(args)
    args[0] = this.constructor.name + ':' + args[0]
    eventEmitter[Events.once].apply(eventEmitter, args)
  }
  get DataSource() {
    return this._dataSource
  }

  /**
   * Plain vanilla joi schema validation
   * @param { Object } input - the object to validate
   * @returns { Object } data - the validated data
   */
  async validate(options: any): Promise<object> {
    if (this._schema.validate) {
      let data: any = {}
      let customKeys = Object.keys(this)
      for (let i = 0; i < customKeys.length; i++) {
        let prop = customKeys[i]
        data[prop] = this[prop]
      }

      let opts = Object.assign({}, this._options.validation, options)
      const unknownProps = opts.unknownProps
      delete opts.unknownProps

      switch (unknownProps) {
        case 'allow':
          opts.stripUnknown = false
          opts.allowUnknown = true
          break
        case 'error':
          opts.stripUnknown = false
          opts.allowUnknown = false
          break
        case 'strip':
        default:
          opts.stripUnknown = true
          opts.allowUnknown = false
          break
      }

      opts.abortEarly = opts.abortEarly === true
      return await this._schema.validate(data, opts)
    }
    return {}
  }

  /**
   * Return the pure json representation of the model
   * Note: this also allows for the model to be stringified
   *
   * @returns { Object } object - the pure data
   */
  async toObject(options: Partial<ModelToObjectOptions>): Promise<object> {
    options = clone(options)

    const computed = options.computed
    delete options.computed

    let json: any
    if (options.skipValidation) {
      json = JSONStringify(this)
    } else {
      json = await this.validate(options)
    }

    if (computed) {
      let computedProps = Object.keys(this._schema.computed)
      for (let i = 0; i < computedProps.length; i++) {
        let prop = computedProps[i]
        json[prop] = this[prop]
      }
    }
    return json
  }
}
// Moving this to the class
// setup static event methods
// for (let i = 0; i < eventMethods.length; i++) {
//   let eventMethod = eventMethods[i]
//   Model[eventMethod] = function () {
//     let args = [].slice.call(arguments)
//     args[0] = this.name + ':' + args[0]
//     eventEmitter[eventMethod].apply(eventEmitter, args)
//   }
// }