'use strict'

class Superchain {
  constructor (conf) {
    this.__chain = []
  }

  add (link) {
    if (typeof link !== 'function') {
      throw new TypeError(`Unsupported chain-link type. Only functions are allowed. Input value was ${this.getLinkType(link)}`)
    }

    this.__chain.push(link)
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

  run (ctx) {
    return new Promise((resolve, reject) => {
      const len = this.__chain.length
      const result = []
      const next = (item) => {
      console.log('ITEM', item)
        if (item === len) {
          return resolve(result)
        }

        const link = this.__chain[item]
        if (!link) {

        } else {
          link(ctx, (err, data) => {
            if (err) throw err
            result.push(data)
            next(item += 1)
          })
        }
      }

      next(0)
    })
  }
}

module.exports = Superchain
