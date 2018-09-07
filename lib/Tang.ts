import { asyncForEach } from './helpers/asyncForEach'
import { Model, ModelOptions } from './Model';
import { Schema } from './Schema';
import factory from './factory'

interface TangOptions {
    breakOnError: any
}
interface ModelSomething {
    [index: string]: Model
}
export class Tang {
    Schema: Schema | undefined
    models: ModelSomething;
    constructor() {
        // this.Schema
        this.models = {}
    }

    model(name: string, schema: Schema, options: ModelOptions = {}) {
        if (schema) {
            this.models[name] = factory(name, schema, options)
        }
        if (!this.models[name]) {
            throw new Error('Model not found:' + name)
        }
        return this.models[name]
    }

    async validate(target: any[] | object, options: TangOptions = { breakOnError: false }) {
        let isArray = target instanceof Array
        let returnVal: any

        if (isArray) {
            returnVal = []
        } else {
            returnVal = {}
        }

        const breakOnError = options.breakOnError
        delete options.breakOnError
        // returnVal = await asyncForEach([].concat(target), async (model: any) => {
        let arr: any = [] 
        returnVal = await asyncForEach(arr.concat(target), async (model: any) => {
            try {
                let data = await model.validate(options)
                if (isArray) {
                    returnVal.push(data)
                    return returnVal
                }
                return data
            } catch (err) {
                if (breakOnError) {
                    // TODO:
                    // No idea where index is comming from
                    // return Promise.reject({ index, model, err })
                    return Promise.reject({ model, err })

                }
                // TODO:
                // No idea where errors is comming from
                // errors.push({ index, model, err })
            }
        })
        return returnVal
    }
}