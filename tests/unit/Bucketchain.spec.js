'use strict'

const inspect = require('inspect.js')
const Bucketchain = require('../../src/Bucketchain')
const Superchain = require('../../src/Superchain')

describe('Bucketchain', () => {
  describe('class', () => {
    it('Should be a Bucketchain class', () => {
      inspect(Bucketchain).isClass()
    })

    it('should instantiate a Bucketchain', () => {
      const bc = new Bucketchain()
      inspect(bc).isInstanceOf(Bucketchain)
      inspect(bc).hasKey('__buckets')
    })
  })

  describe('bucket()', () => {
    it('should add a bucket to the bucket-chain', () => {
      const bc = new Bucketchain()
      bc.bucket('fooBucket')
      inspect(bc.fooBucket).isObject()
      inspect(bc.__buckets).isArray().hasLength(1)
      inspect(bc.__buckets).getItem(0).isEqual(bc.fooBucket)
      inspect(bc.__buckets).getItem(0).isInstanceOf(Superchain)
    })

    it('should add multiple buckets to the bucket-chain', () => {
      const bc = new Bucketchain()
      bc.bucket('fooBucket')
      bc.bucket('barBucket')
      bc.bucket('blaBucket')
      inspect(bc.fooBucket).isObject()
      inspect(bc.__buckets).isArray().hasLength(3)
      inspect(bc.__buckets).getItem(0).isEqual(bc.fooBucket)
      inspect(bc.__buckets).getItem(0).isInstanceOf(Superchain)
      inspect(bc.__buckets).getItem(1).isEqual(bc.barBucket)
      inspect(bc.__buckets).getItem(1).isInstanceOf(Superchain)
      inspect(bc.__buckets).getItem(2).isEqual(bc.blaBucket)
      inspect(bc.__buckets).getItem(2).isInstanceOf(Superchain)
    })
  })

  describe('run()', () => {
    it('should run a bucket-chain', () => {
      const bc = new Bucketchain()
      bc.bucket('fooBucket')
      bc.bucket('barBucket')
      bc.bucket('blaBucket')

      bc.fooBucket.add(function (next) { this.one = 'one'; next() })
      bc.barBucket.add(function (next) { this.two = 'two'; next() })
      bc.blaBucket.add(function (next) { this.three = 'three'; next() })

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res).isObject()
        inspect(res).isEql({
          one: 'one',
          two: 'two',
          three: 'three'
        })
      })
    })

    it('should spread a context in a bucket-chain', () => {
      const bc = new Bucketchain()
      bc.bucket('fooBucket')
      bc.bucket('barBucket')
      bc.bucket('blaBucket')

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three'
      }

      bc.fooBucket.add(function (next) { this.one = ctx.one; next() })
      bc.barBucket.add(function (next) { this.two = ctx.two; next() })
      bc.blaBucket.add(function (next) { this.three = ctx.three; next() })

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res).isObject()
        inspect(res).isEql({
          one: 'one',
          two: 'two',
          three: 'three'
        })
      })
    })

    it('should cancel a bucket-chain', () => {
      const bc = new Bucketchain()
      bc.bucket('fooBucket')
      bc.bucket('barBucket')
      bc.bucket('blaBucket')

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three'
      }

      bc.fooBucket.add(function (next) { this.one = ctx.one; next() })
      bc.barBucket.add(function (next) { throw new Error('Cancel chain') })
      bc.blaBucket.add(function (next) { this.three = ctx.three; next() })

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res).isObject()
        inspect(res).isEql({
          one: 'one',
          two: 'two',
          three: 'three'
        })
      }).catch((err) => {
        inspect(err).isObject()
        inspect(err.message).isEql('Cancel chain')
      })
    })
  })
})
