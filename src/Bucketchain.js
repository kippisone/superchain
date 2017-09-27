'use strict'

const Superchain = require('./Superchain')

class Bucketchain {
  constructor () {
    this.__buckets = []
  }

  /**
   * Create new bucket in the bucket-chain
   * @param  {string} bucketName Bucket name
   *
   * @chainable
   * @return {object}            Returns this value
   */
  bucket (bucketName) {
    const chain = new Superchain()
    this.__buckets.push(chain)
    this[bucketName] = chain
    return this
  }

  errorBucket (bucketName) {
    const chain = new Superchain()
    this.__errorBuckets = chain
    this[bucketName] = chain
    return this
  }

  run () {
    const args = Array.prototype.slice.call(arguments)
    return new Promise((resolve, reject) => {
      let i = 0
      const thisContext = {}

      const next = () => {
        const chain = this.__buckets[i]
        if (!chain) return resolve(thisContext)
        i += 1
        chain.runWith.apply(chain, [thisContext].concat(args))
          .then(() => {
            next()
          }).catch((err) => {
            reject(err)
          })
      }

      next()
    })
  }
}

module.exports = Bucketchain
