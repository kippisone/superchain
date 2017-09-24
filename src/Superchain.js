'use strict'

const co = require('co-utils')

class Superchain {
  constructor (conf) {
    this.__chain = []
    this.__final = []
  }

  add (link) {
    if (typeof link !== 'function') {
      throw new TypeError(`Unsupported chain-link type. Only functions are allowed. Input value was ${this.getLinkType(link)}`)
    }

    this.__chain.push(link)
  }

  final (link) {
    if (typeof link !== 'function') {
      throw new TypeError(`Unsupported chain-link type. Only functions are allowed. Input value was ${this.getLinkType(link)}`)
    }

    this.__final.push(link)
  }
  
  errorHandler() {
    
  }
  
  run (ctx) {
    const args = Array.prototype.slice.call(arguments)
    const thisContext = {}
    
    return new Promise((resolve, reject) => {
      const chain = [].concat(this.__chain, this.__final)

      let i = 0
      const next = () => {
        const fn = chain[i]
        if (!fn) return resolve(thisContext)
        i += 1
        try {
          if (fn.constructor.name === 'GeneratorFunction') {
            co(fn.bind.apply(fn, [thisContext].concat(args, [next]))).then((res) => {}).catch((err) => reject(err))
          } else if (fn.constructor.name === 'AsyncFunction') {
            fn.apply(thisContext, args.concat([next])).then((res) => {}).catch((err) => reject(err))
          } else {
            const finish = () => {
              return resolve(thisContext)
            }
            
            fn.apply(thisContext, args.concat([next, finish]))
          }
        } catch (err) {
          return reject(err)
        }
      }

      next()
    })
  }

  getLinkType (link) {
    const type = typeof link
    if (Array.isArray(link)) {
      return 'array'
    } else if (type === 'object' && link === null) {
      return 'null'
    }

    return type
  }
}

module.exports = Superchain
