'use strict'

const Superchain = require('./Superchain')

class Bucketchain {
  constructor () {
    this.__buckets = new Map()
  }

  /**
   * Create new bucket in the bucket-chain
   * @param  {string} bucketName Bucket name
   *
   * @return {object} Returns the new chain instance
   */
  bucket (bucketName) {
    if (typeof this[bucketName] === 'function') throw new Error(`Bucket name ${bucketName} not allowed!`)
    const chain = new Superchain()
    this.__buckets.set(bucketName, chain)
    this[bucketName] = chain
    return chain
  }

  /**
   * Returns a bucket by its name
   *
   * @param  {string} bucketName Bucket name
   * @return {object}            Returns a Bucket, which is a Superchain instance
   */
  get (bucketName) {
    return this.__buckets.get(bucketName)
  }

  errorBucket (bucketName) {
    if (typeof this[bucketName] === 'function') throw new Error(`Bucket name ${bucketName} not allowed!`)
    const chain = new Superchain()
    this.__errorBucket = chain
    this[bucketName] = chain
    return chain
  }

  run () {
    const args = Array.prototype.slice.call(arguments)
    return new Promise((resolve, reject) => {
      const thisContext = {}
      const buckets = this.__buckets.entries()

      const next = () => {
        const chain = buckets.next()
        if (chain.done) return resolve(thisContext)
        const chainObj = chain.value[1]
        chainObj.runWith.apply(chainObj, [thisContext].concat(args))
          .then(() => {
            next()
          }).catch((err) => {
            if (this.__errorBucket) {
              this.__errorBucket.runWith.apply(this.__errorBucket, [thisContext].concat(args))
                .then(() => {
                  resolve(thisContext)
                })
                .catch((err) => {
                  reject(err)
                })
            } else {
              reject(err)
            }
          })
      }

      next()
    })
  }
}

module.exports = Bucketchain
