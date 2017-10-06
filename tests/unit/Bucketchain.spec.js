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
      inspect(bc.__buckets.size).isEql(1)
      inspect(bc.__buckets.get('fooBucket')).isEqual(bc.fooBucket)
      inspect(bc.__buckets.get('fooBucket')).isInstanceOf(Superchain)
    })

    it('should add multiple buckets to the bucket-chain', () => {
      const bc = new Bucketchain()
      bc.bucket('fooBucket')
      bc.bucket('barBucket')
      bc.bucket('blaBucket')
      inspect(bc.fooBucket).isObject()
      inspect(bc.__buckets.size).isEql(3)
      inspect(bc.__buckets.get('fooBucket')).isEqual(bc.fooBucket)
      inspect(bc.__buckets.get('fooBucket')).isInstanceOf(Superchain)
      inspect(bc.__buckets.get('barBucket')).isEqual(bc.barBucket)
      inspect(bc.__buckets.get('barBucket')).isInstanceOf(Superchain)
      inspect(bc.__buckets.get('blaBucket')).isEqual(bc.blaBucket)
      inspect(bc.__buckets.get('blaBucket')).isInstanceOf(Superchain)
    })
  })

  describe('errorBucket()', () => {
    it('should add an error bucket to the bucket-chain', () => {
      const bc = new Bucketchain()
      bc.errorBucket('errBucket')
      inspect(bc.errBucket).isObject()
      inspect(bc.errBucket).isEqual(bc.__errorBucket)
      inspect(bc.__errorBucket).isInstanceOf(Superchain)
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

    it('should run a chain one by one', () => {
      const bc = new Bucketchain()
      bc.bucket('fooBucket')
      bc.bucket('barBucket')
      bc.bucket('blaBucket')

      bc.fooBucket.add(function (next) { this.output = ['one']; next() })
      bc.barBucket.add(function (next) { this.output.push('two'); next() })
      bc.blaBucket.add(function (next) { this.output.push('three'); next() })
      bc.fooBucket.add(function (next) { this.output.push('four'); next() })
      bc.barBucket.add(function (next) { this.output.push('five'); next() })

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res.output).isArray()
        inspect(res.output).isEql(['one', 'four', 'two', 'five', 'three'])
      })
    })

    it('should jump into an error chain', () => {
      const bc = new Bucketchain()
      bc.bucket('fooBucket')
      bc.bucket('barBucket')
      bc.bucket('blaBucket')
      bc.errorBucket('errBucket')

      bc.fooBucket.add(function (next) { this.output = ['one']; next() })
      bc.barBucket.add(function (next) { throw new Error('Chain failed') })
      bc.blaBucket.add(function (next) { this.output.push('three'); next() })
      bc.fooBucket.add(function (next) { this.output.push('four'); next() })
      bc.barBucket.add(function (next) { this.output.push('five'); next() })
      bc.errBucket.add(function (next) { this.output.push('err'); next() })
      bc.errBucket.add(function (next) { this.output.push('err2'); next() })

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res.output).isArray()
        inspect(res.output).isEql(['one', 'four', 'err', 'err2'])
      })
    })
  })
})
