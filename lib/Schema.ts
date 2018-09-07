const Joi = require('joi')
import { JSONStringify } from './helpers/JSONStringify';
require('colors')
interface SchemaStatics {
  [index: string]: Function
}
interface SchemaComputed {
  [index: string]: Function
}
interface JoiSchema {
  [index: string]: any
}
interface DefaultValue {
  [index: string]: any
}
interface SchemaMethods {
  [index: string]: Function
}
export class Schema {
  isSchema: boolean;
  _json: any;
  _options: {};
  _joi: any;
  _defaultValues: any;
  statics: SchemaStatics;
  methods: SchemaMethods;
  computed: SchemaComputed;
  static Types: {
    String: StringConstructor; Number: NumberConstructor; Boolean: BooleanConstructor; Object: ObjectConstructor; Array: ArrayConstructor; Date: DateConstructor; RegExp: RegExpConstructor; Id: any; // TODO: Do something here, not sure what
    Any: any; Mixed: any;
  };
  constructor(json: object, options: object = {}) {
    this.isSchema = true

    if (!json || (typeof json !== 'object' && !Object.keys(json).length)) {
      throw new Error('Schema expects object with at least one key/value pair')
    }
    this._json = json
    this._options = options
    this._joi = this._parse(json)
    this._joi.validate(
      {},
      {
        skipFunctions: true,
        presence: 'optional',
        noDefaults: false
      },
      (err: any, value: any) => {
        this._defaultValues = value
      }
    )
    // this._schemaKeys = getObjectKeys(json)

    this.statics = {}
    this.methods = {}
    this.computed = {}
  }

  get options() {
    return this._options
  }

  // get schemaKeys() {
  //   return this._schemaKeys
  // }

  get json() {
    return this._json
  }

  get joi() {
    return this._joi
  }

  get defaultValues() {
    return this._defaultValues
  }

  validate(data: any, options: object) {
    return this._joi.validate(data, options)
  }

  async _parse(data: any): Promise<any> {
    // check if there is a schema, if so this is a reference to a model
    if (data.schema) {
      return data.schema.joi
    }
    // get data type
    let type = this._parseType(data)
    // if it is already a joi schema then return it
    if (type === 'joi') {
      return data.type || data
    }

    // create a joi type schema
    let joiType
    try {
      joiType = Joi[type]()
    } catch (e) {
      let t = JSONStringify(type)
      throw new Error(`Joi does not support the type ${t}`)
    }

    if (type === 'object') {
      // if the type is an object then loop through and get child schemas
      let schema: JoiSchema = {}

      for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
          schema[prop] = this._parse(data[prop])
          // do not parse array attributes
          if (data[prop].type) {
            this._parseAttrs(prop, schema[prop], data, (val: any) => {
              schema[prop] = val
            })
          }
        }
      }
      joiType = joiType.append(schema)
      // check if any children have default values, if so we have to create
      // a default object so it displays properly
      if (
        Object.keys(data).length &&
        JSONStringify(data).match(/"default":/gi)
      ) {
        const defaultObject = this._createDefaultObject(data)
        joiType = joiType.default(defaultObject)
      }
    } else if (type === 'array') {
      // if the type is an array then create sub schema for children
      // currently only supports only 1 child schema
      if (data.length > 1) {
        throw new Error('Array cannot contain more than one schema')
      } else if (data.length === 0) {
        joiType = Joi.array().items(Joi.any())
      } else {
        let child = data[0]
        // if data was defined as Array and not [], there will be no child
        if (child) {
          let childJoiType = child.isJoi ? child : this._parse(child)
          joiType = Joi.array().items(childJoiType)
        } else {
          joiType = Joi.array().items(Joi.any())
        }
      }
      // check for %words% => for injection
      // joiType = Joi.alternatives().try(joiType, Joi.string().regex(/%\w+%/))
    }

    return joiType
  }

  _parseType(item: any, prop = ''): any {
    if (item === null || item === undefined) {
      throw new Error(`Property "${prop}" cannot be null or undefined`)
    }
    let type = typeof item
    // if object has a type and it isn't a property called "type"
    if (item.type && !item.type.type) {
      type = this._parseType(item.type, 'type')
    }
    switch (type) {
      case 'object':
        type = item.type
        if (item.isSchema) {
          return 'schema'
        }
        if (item.isJoi) {
          return 'joi'
        }
        if (item instanceof Date) {
          return 'date'
        }
        if (item instanceof Array) {
          return 'array'
        }
        if (type === typeof Object) {
          return 'object'
        }
        return 'object'
      case 'function':
        if (item === String) {
          return 'string'
        }
        if (item === Number) {
          return 'number'
        }
        if (item === Boolean) {
          return 'boolean'
        }
        if (item === Date) {
          return 'date'
        }
        if (item === Array) {
          return 'array'
        }
        if (item === Object) {
          return 'object'
        }
        if (item === Function) {
          return 'func'
        }
        if (item.toString().indexOf('[native code]') === -1) {
          return 'func'
        }
        return 'object'
      default:
        return type
    }
  }

  _parseAttrs(prop: any, joiType: any, data: any, callback: Function) {
    let item = data[prop]
    if (typeof item !== 'function') {
      for (let attr in item) {
        // do not parse type
        if (attr !== 'type') {
          let val = item[attr]
          try {
            if (typeof val === 'function') {
              joiType = joiType[attr](val, `default function() for ${prop}`)
            } else {
              joiType = joiType[attr](val)
            }
          } catch (e) {
            throw new Error(`Invalid attribute "${prop}"`)
          }
        }
      }
    }
    callback(joiType)
  }

  _createDefaultObject(data: any) {
    let defaultValue: DefaultValue = {};
    for (let prop in data) {
      if (data[prop].hasOwnProperty('default')) {
        defaultValue[prop] = data[prop].default
      } else {
        let type = this._parseType(data[prop], prop)
        if (type === 'object') {
          defaultValue[prop] = this._createDefaultObject(data[prop])
        }
      }
    }
    return defaultValue
  }
}
// TODO: this will need to be addressed.
Schema.Types = {
  String,
  Number,
  Boolean,
  Object,
  Array,
  Date,
  RegExp,
  Id: Joi.any(), // TODO: Do something here, not sure what
  Any: Joi.any(),
  Mixed: Joi.any()
}
