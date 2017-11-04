'use strict'

const co = require('co-utils')

class Superchain {
  constructor (conf) {
    conf = conf || {}
    this.clear()
    this.debug = false
    this.name = conf.name || ''
  }

  add (link) {
    if (typeof link !== 'function') {
      throw new TypeError(`Unsupported chain-link type. Only functions are allowed. Input value was ${this.getLinkType(link)}`)
    }

    if (link.constructor.name === 'GeneratorFunction') {
      return this.__chain.push(co.wrap(link))
    }

    if (this.debug) {
      console.log('[Superchain] Add link to chain', this.name, link.name)
    }

    this.__chain.push(link)
  }

  final (link) {
    if (typeof link !== 'function') {
      throw new TypeError(`Unsupported chain-link type. Only functions are allowed. Input value was ${this.getLinkType(link)}`)
    }

    if (link.constructor.name === 'GeneratorFunction') {
      return this.__final.push(co.wrap(link))
    }

    if (this.debug) {
      console.log('[Superchain] Add final link to chain', this.name, link.name)
    }

    this.__final.push(link)
  }

  when (condition) {
    if (this.__subChains.has(condition)) {
      return this.__subChains.get(condition)
    }

    const subchain = new Superchain()
    let thisContext

    this.__subChains.set(condition, subchain)

    const conditionFn = function conditionFn () {
      const args = Array.prototype.slice.call(arguments, 0, -2)
      const cont = condition.apply(this, args)
      const next = arguments[arguments.length - 2]
      thisContext = this

      if (!cont) {
        return next()
      }

      const subCall = subchain.runWith.apply(subchain, [thisContext].concat(args))
      subCall.then((data) => {
        next()
      }).catch((err) => {
        thisContext.cancelChain(err)
        next()
      })
    }

    conditionFn.chain = subchain

    this.add(conditionFn)

    return subchain
  }

  run (ctx) {
    const args = Array.prototype.slice.call(arguments)
    return this.runWith.apply(this, [{}].concat(args))
  }

  runWith (thisContext, ctx) {
    const args = Array.prototype.slice.call(arguments, 1)

    thisContext.__exitChain = false
    let __chainErr = null
    thisContext.cancelChain = function cancelChain (err) {
      this.__chainErr = err
    }

    const chain = [function initialLink () {
      return arguments[args.length]()
    }].concat(this.__chain, this.__final)

    let i = 0
    const self = this
    const next = () => {
      return new Promise((resolve, reject) => {
        if (__chainErr) {
          return reject(__chainErr)
        }

        if (thisContext.__exitChain) {
          if (this.debug) {
            console.log('[Superchain] Exit chain', this.name)
          }

          return resolve(thisContext)
        }

        const fn = chain[i]

        if (!fn) {
          return resolve(thisContext)
        }

        if (this.debug) {
          console.log('[Superchain] Run chain link', this.name, fn.name)
        }

        i += 1
        try {
          const nextFn = function nextFunc () {
            return next().then((res) => {
              resolve(res)
              return res
            }).catch((err) => {
              reject(err)
            })
          }

          const exitFn = function exitFn () {
            if (self.debug) {
              console.log('[Superchain] Chain exit called', self.name)
            }

            self.__exitChain = true
            return resolve(thisContext)
          }

          fn.apply(thisContext, args.concat([nextFn, exitFn]))
        } catch (err) {
          return reject(err)
        }
      })
    }

    if (this.debug) {
      console.log('[Superchain] Run chain', this.name)
    }

    const p = next().then((res) => {
      return res
    })

    return {
      then (fn) {
        return p.then(fn)
      },
      catch (fn) {
        return p.catch(fn)
      }
    }
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

  clear () {
    if (this.debug) {
      console.log('[Superchain] Run chain', this.name)
    }

    this.__chain = []
    this.__final = []
    this.__subChains = new Map()
  }
}

module.exports = Superchain
