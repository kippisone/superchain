'use strict'

const inspect = require('inspect.js')
const Bucketchain = require('../../').Bucketchain
const Superchain = require('../../').Superchain

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
      const fooBucket = bc.bucket('fooBucket')
      inspect(bc.get('fooBucket')).isObject()
      inspect(bc.__buckets.size).isEql(1)
      inspect(bc.__buckets.get('fooBucket')).isEqual(fooBucket)
      inspect(bc.__buckets.get('fooBucket')).isInstanceOf(Superchain)
    })

    it('should add multiple buckets to the bucket-chain', () => {
      const bc = new Bucketchain()
      const fooBucket = bc.bucket('fooBucket')
      const barBucket = bc.bucket('barBucket')
      const blaBucket = bc.bucket('blaBucket')
      inspect(bc.get('fooBucket')).isObject()
      inspect(bc.__buckets.size).isEql(3)
      inspect(bc.__buckets.get('fooBucket')).isEqual(fooBucket)
      inspect(bc.__buckets.get('fooBucket')).isInstanceOf(Superchain)
      inspect(bc.__buckets.get('barBucket')).isEqual(barBucket)
      inspect(bc.__buckets.get('barBucket')).isInstanceOf(Superchain)
      inspect(bc.__buckets.get('blaBucket')).isEqual(blaBucket)
      inspect(bc.__buckets.get('blaBucket')).isInstanceOf(Superchain)
    })
  })

  describe('errorBucket()', () => {
    it('should add an error bucket to the bucket-chain', () => {
      const bc = new Bucketchain()
      const errBucket = bc.errorBucket('errBucket')
      inspect(errBucket).isObject()
      inspect(errBucket).isEqual(bc.__errorBucket)
      inspect(errBucket).isInstanceOf(Superchain)
    })
  })

  describe('run()', () => {
    it('should run a bucket-chain', () => {
      const bc = new Bucketchain()
      const fooBucket = bc.bucket('fooBucket')
      const barBucket = bc.bucket('barBucket')
      const blaBucket = bc.bucket('blaBucket')

      fooBucket.add(function (next) { this.one = 'one'; next() })
      barBucket.add(function (next) { this.two = 'two'; next() })
      blaBucket.add(function (next) { this.three = 'three'; next() })

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res).isObject()
        inspect(res).hasProps({
          one: 'one',
          two: 'two',
          three: 'three'
        })
      })
    })

    it('should spread a context in a bucket-chain', () => {
      const bc = new Bucketchain()
      const fooBucket = bc.bucket('fooBucket')
      const barBucket = bc.bucket('barBucket')
      const blaBucket = bc.bucket('blaBucket')

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three'
      }

      fooBucket.add(function (next) { this.one = ctx.one; next() })
      barBucket.add(function (next) { this.two = ctx.two; next() })
      blaBucket.add(function (next) { this.three = ctx.three; next() })

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res).isObject()
        inspect(res).hasProps({
          one: 'one',
          two: 'two',
          three: 'three'
        })
      })
    })

    it('should cancel a bucket-chain', () => {
      const bc = new Bucketchain()
      const fooBucket = bc.bucket('fooBucket')
      const barBucket = bc.bucket('barBucket')
      const blaBucket = bc.bucket('blaBucket')

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three'
      }

      fooBucket.add(function (next) { this.one = ctx.one; next() })
      barBucket.add(function (next) { throw new Error('Cancel chain') })
      blaBucket.add(function (next) { this.three = ctx.three; next() })

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
      const fooBucket = bc.bucket('fooBucket')
      const barBucket = bc.bucket('barBucket')
      const blaBucket = bc.bucket('blaBucket')

      fooBucket.add(function (next) { this.output = ['one']; next() })
      barBucket.add(function (next) { this.output.push('two'); next() })
      blaBucket.add(function (next) { this.output.push('three'); next() })
      fooBucket.add(function (next) { this.output.push('four'); next() })
      barBucket.add(function (next) { this.output.push('five'); next() })

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res.output).isArray()
        inspect(res.output).isEql(['one', 'four', 'two', 'five', 'three'])
      })
    })

    it('should jump into an error chain', () => {
      const bc = new Bucketchain()
      const fooBucket = bc.bucket('fooBucket')
      const barBucket = bc.bucket('barBucket')
      const blaBucket = bc.bucket('blaBucket')
      const errBucket = bc.errorBucket('errBucket')

      fooBucket.add(function (next) { this.output = ['one']; next() })
      barBucket.add(function (next) { throw new Error('Chain failed') })
      blaBucket.add(function (next) { this.output.push('three'); next() })
      fooBucket.add(function (next) { this.output.push('four'); next() })
      barBucket.add(function (next) { this.output.push('five'); next() })
      errBucket.add(function (err, next) { this.output.push('err'); next() }) // eslint-disable-line handle-callback-err
      errBucket.add(function (err, next) { this.output.push('err2'); next() }) // eslint-disable-line handle-callback-err

      const bcRun = bc.run()
      inspect(bcRun).isPromise()
      return bcRun.then((res) => {
        inspect(res.output).isArray()
        inspect(res.output).isEql(['one', 'four', 'err', 'err2'])
      })
    })
  })
})
