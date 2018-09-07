const aryIndexRx = /\[(.*?)\]/g

const delimiter = '.'

function isUndefined(val: any) {
  return typeof val === 'undefined'
}

function pathToArray(path: any = '', data: any) {
  if (path instanceof Array) {
    return path
  }

  path = path.replace(aryIndexRx, function(m: any, g1: any) {
    if (g1.indexOf('"') !== -1 || g1.indexOf("'") !== -1) {
      return delimiter + g1
    }

    return delimiter + resolve(data).get(g1)
  })

  return path.split(delimiter)
}

class Resolve {
  rawData: any;
  constructor(data = {}) {
    this.rawData = data
  }

  get(path: string, extract = false) {
    let data = this.rawData,
      prev = data,
      arr = pathToArray(path, data),
      prop = '',
      i = 0,
      len = arr.length

    while (data && i < len) {
      prop = arr[i]

      prev = data

      data = data[prop]

      if (data === undefined) {
        return data
      }

      i += 1
    }

    if (extract) {
      delete prev[prop]
    }

    return data
  }

  set(path: any, value: any) {
    if (isUndefined(path)) {
      throw new Error('Resolve requires "path"')
    }

    let data = this.rawData,
      arr = pathToArray(path, data),
      prop = '',
      i = 0,
      len = arr.length - 1

    while (i < len) {
      prop = arr[i]

      if (data[prop] === undefined) {
        data = data[prop] = {}
      } else {
        data = data[prop]
      }

      i += 1
    }

    if (arr.length > 0) {
      data[arr.pop()] = value
    }

    return this.rawData
  }

  default(path: any, value: any) {
    if (isUndefined(this.get(path))) {
      this.set(path, value)
    }
  }

  clear() {
    let d = this.rawData

    for (let e in d) {
      if (d.hasOwnProperty(e)) {
        delete d[e]
      }
    }
  }

  path(path: any) {
    return this.set(path, {})
  }
}

let resolve = function(data: any) {
  return new Resolve(data)
}

// Add a comment to this line
export default resolve
