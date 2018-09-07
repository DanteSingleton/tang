import { Model, ModelOptions } from './Model';
import { Schema } from './Schema';
class TangModel extends Model {
  // Dirty hack to remove this:any errors
  [key: string]: any

  public name: string;
  constructor(data: any, schema: Schema, options: ModelOptions) {
    super(data, schema, options)
    this.name = ''
  }
}

/**
 * Constructs a Model class
 * @param {*} name
 * @param {*} schema
 * @param {*} options
 */
function factory(name: string, schema: Schema, options: ModelOptions): TangModel {
  let _TangModel = new TangModel(null, schema, options)

  // TangModel.options = options
  // TangModel.schema = schema

  // Object.defineProperty(TangModel, 'name', { value: name })
  _TangModel.name = name

  for (let name in schema.statics) {
    _TangModel[name] = function() {
      return schema.statics[name].apply(TangModel, arguments)
    }
  }

  return _TangModel
}

export default factory