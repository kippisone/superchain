'use strict'

const inspect = require('inspect.js')
const sinon = require('sinon')
inspect.useSinon(sinon)

const Superchain = require('../../').Superchain

function isAsyncSupported () {
  try {
    // eslint-disable-next-line no-eval
    return !!eval('(async function () {})')
  } catch (err) {
    // ignore error
    return false
  }
}

describe('Superchain', () => {
  describe('instance', () => {
    it('Is a class', () => {
      inspect(Superchain).isClass()
    })

    it('create a superchain instance', () => {
      const superchain = new Superchain()
      inspect(superchain).isInstanceOf(Superchain)
    })

    it('shoudl have an empty chain', () => {
      const superchain = new Superchain()
      inspect(superchain).hasKey('__chain')
      inspect(superchain.__chain).isArray().isEmpty()
    })

    it('Should have a add() method', () => {
      const superchain = new Superchain()
      inspect(superchain).hasMethod('add')
    })
  })

  describe('getLinkType()', () => {
    let superchain

    beforeEach(() => {
      superchain = new Superchain()
    })

    const tests = [
      { input: 'foo', type: 'string' },
      { input: 123, type: 'number' },
      { input: null, type: 'null' },
      { input: undefined, type: 'undefined' },
      { input: {}, type: 'object' },
      { input: [], type: 'array' }
    ]

    for (const item of tests) {
      it(`should return type ${item.type} for value ${item.input}`, () => {
        inspect(superchain.getLinkType(item.input)).isEql(item.type)
      })
    }
  })

  describe('add()', () => {
    let superchain

    beforeEach(() => {
      superchain = new Superchain()
    })

    it('adds a function to the chain', () => {
      const fn = sinon.stub()
      const fn2 = sinon.stub()
      const fn3 = sinon.stub()
      superchain.add(fn)
      superchain.add(fn2)
      superchain.add(fn3)

      inspect(superchain.__chain).isEql([fn, fn2, fn3])
    })

    it('should throw an error if an unsupported link type is adding', () => {
      inspect(superchain.add).withArgsOn(superchain, 'foo').doesThrow(/Unsupported chain-link.+was string/)
      inspect(superchain.add).withArgsOn(superchain, 123).doesThrow(/Unsupported chain-link.+was number/)
      inspect(superchain.add).withArgsOn(superchain, null).doesThrow(/Unsupported chain-link.+was null/)
      inspect(superchain.add).withArgsOn(superchain, undefined).doesThrow(/Unsupported chain-link.+was undefined/)
    })

    it('adds a generator function to the chain', () => {
      const fn = function * () {}
      const fn2 = function * () {}
      const fn3 = function * () {}
      superchain.add(fn)
      superchain.add(fn2)
      superchain.add(fn3)

      inspect(superchain.__chain).isNotEql([fn, fn2, fn3])
      inspect(superchain.__chain).isEql([inspect.match.func, inspect.match.func, inspect.match.func])
    })

    it('adds an async function to the chain', function () {
      if (!isAsyncSupported()) {
        this.test.title = `(SKIP TEST: async functions not supported by current Node version!) ${this.test.title})`
        this.skip()
        return
      }

      const fn = eval('(async function () {})') // eslint-disable-line no-eval
      const fn2 = eval('(async function () {})') // eslint-disable-line no-eval
      const fn3 = eval('(async function () {})') // eslint-disable-line no-eval
      superchain.add(fn)
      superchain.add(fn2)
      superchain.add(fn3)

      inspect(superchain.__chain).isEql([fn, fn2, fn3])
    })

    it('adds an promise returning function to the chain', function () {
      const fn = () => { return Promise.resolve() }
      const fn2 = () => { return Promise.resolve() }
      const fn3 = () => { return Promise.resolve() }
      superchain.add(fn)
      superchain.add(fn2)
      superchain.add(fn3)

      inspect(superchain.__chain).isEql([fn, fn2, fn3])
    })
  })

  describe('final()', () => {
    let superchain

    beforeEach(() => {
      superchain = new Superchain()
    })

    it('adds a function to the chain', () => {
      const fn = sinon.stub()
      const fn2 = sinon.stub()
      const fn3 = sinon.stub()
      superchain.final(fn)
      superchain.final(fn2)
      superchain.final(fn3)

      inspect(superchain.__final).isEql([fn, fn2, fn3])
    })

    it('should throw an error if an unsupported link type is adding', () => {
      inspect(superchain.final).withArgsOn(superchain, 'foo').doesThrow(/Unsupported chain-link.+was string/)
      inspect(superchain.final).withArgsOn(superchain, 123).doesThrow(/Unsupported chain-link.+was number/)
      inspect(superchain.final).withArgsOn(superchain, null).doesThrow(/Unsupported chain-link.+was null/)
      inspect(superchain.final).withArgsOn(superchain, undefined).doesThrow(/Unsupported chain-link.+was undefined/)
    })

    it('adds a generator function to the chain', () => {
      const fn = function * () {}
      const fn2 = function * () {}
      const fn3 = function * () {}
      superchain.final(fn)
      superchain.final(fn2)
      superchain.final(fn3)

      inspect(superchain.__final).isNotEql([fn, fn2, fn3])
      inspect(superchain.__final).isEql([inspect.match.func, inspect.match.func, inspect.match.func])
    })

    it('adds an async function to the chain', function () {
      if (!isAsyncSupported()) {
        this.test.title = `(SKIP TEST: async functions not supported by current Node version!) ${this.test.title})`
        this.skip()
        return
      }

      const fn = eval('(async function () {})') // eslint-disable-line no-eval
      const fn2 = eval('(async function () {})') // eslint-disable-line no-eval
      const fn3 = eval('(async function () {})') // eslint-disable-line no-eval
      superchain.final(fn)
      superchain.final(fn2)
      superchain.final(fn3)

      inspect(superchain.__final).isEql([fn, fn2, fn3])
    })
  })

  describe('run()', () => {
    let superchain

    beforeEach(() => {
      superchain = new Superchain()
    })

    it('should run all chain-links, using callbacks', () => {
      const fn1 = function (ctx, next) { this.one = ctx.one; next() }
      const fn2 = function (ctx, next) { this.two = ctx.two; next() }
      const fn3 = function (ctx, next) { this.three = ctx.three; next() }
      const fn4 = function (ctx, next) { this.four = ctx.four; next() }
      const fn5 = function (ctx, next) { this.five = ctx.five; next() }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three',
        four: 'four',
        five: 'five'
      }
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).hasProps({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four',
          five: 'five'
        })
      })
    })

    it('should run all chain-links, using generators', () => {
      const fn1 = function * (ctx, next) { yield {}; this.one = ctx.one; yield next() }
      const fn2 = function * (ctx, next) { yield {}; this.two = ctx.two; yield next() }
      const fn3 = function * (ctx, next) { yield {}; this.three = ctx.three; yield next() }
      const fn4 = function * (ctx, next) { yield {}; this.four = ctx.four; yield next() }
      const fn5 = function * (ctx, next) { yield {}; this.five = ctx.five; yield next() }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three',
        four: 'four',
        five: 'five'
      }
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).hasProps({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four',
          five: 'five'
        })
      })
    })

    it('should run all chain-links, using generators, without yield next()', () => {
      const fn1 = function * (ctx, next) { yield {}; this.one = ctx.one; next() }
      const fn2 = function * (ctx, next) { yield {}; this.two = ctx.two; next() }
      const fn3 = function * (ctx, next) { yield {}; this.three = ctx.three; next() }
      const fn4 = function * (ctx, next) { yield {}; this.four = ctx.four; next() }
      const fn5 = function * (ctx, next) { yield {}; this.five = ctx.five; next() }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three',
        four: 'four',
        five: 'five'
      }
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).hasProps({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four',
          five: 'five'
        })
      })
    })

    it('should run all chain-links, using async function', function () {
      /* eslint-disable no-eval */
      if (!isAsyncSupported()) {
        this.test.title = `(SKIP TEST: async functions not supported by current Node version!) ${this.test.title})`
        this.skip()
        return
      }

      const fn1 = eval('(async function (ctx, next) { await {}; this.one = ctx.one; next() })')
      const fn2 = eval('(async function (ctx, next) { await {}; this.two = ctx.two; next() })')
      const fn3 = eval('(async function (ctx, next) { await {}; this.three = ctx.three; next() })')
      const fn4 = eval('(async function (ctx, next) { await {}; this.four = ctx.four; next() })')
      const fn5 = eval('(async function (ctx, next) { await {}; this.five = ctx.five; next() })')

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three',
        four: 'four',
        five: 'five'
      }
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).hasProps({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four',
          five: 'five'
        })
      })
    })

    it('should run all chain-links, using mixed functions', () => {
      /* eslint-disable no-eval */
      const fn1 = isAsyncSupported()
        ? eval('(async function (ctx, next) { await {}; this.one = \'one\'; next() })')
        : function (ctx, next) { this.one = 'one'; next() }
      const fn2 = function * (ctx, next) { yield {}; this.two = 'two'; next() }
      const fn3 = function (ctx, next) { this.three = 'three'; next() }
      const fn4 = (ctx, next) => { this.four = 'four'; next() }
      const fn5 = isAsyncSupported()
        ? eval('(async function (ctx, next) { await {}; this.five = \'five\'; next() })')
        : function (ctx, next) { this.five = 'five'; next() }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {
        one: 'one',
        two: 'two',
        three: 'three',
        four: 'four',
        five: 'five'
      }
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).hasProps({
          one: 'one',
          two: 'two',
          three: 'three',
          // four: 'four', // this is missing, arrow func has no context
          five: 'five'
        })
      })
    })

    it('should exit a chain if next is not called', () => {
      const fn1 = function (ctx, next) { this.one = 'one'; next() }
      const fn2 = function (ctx, next) { this.two = 'two'; next() }
      const fn3 = function (ctx, next) { this.three = 'three'; next() }
      const fn4 = function (ctx, next, finish) { this.four = 'four'; finish() }
      const fn5 = function (ctx, next) { this.five = 'five' }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {}
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).hasProps({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four'
        })
      })
    })

    it('should takes multiple ctx arguments', () => {
      const fn1 = sinon.stub()
      const fn2 = sinon.stub()

      fn1.yields()
      fn2.yields()

      superchain.add(fn1)
      superchain.add(fn2)

      const req = {}
      const res = {}
      const result = superchain.run(req, res)
      inspect(result).isPromise()
      return result.then((out) => {
        inspect(fn1).wasCalledOnce()
        inspect(fn1).wasCalledWith(req, res)
        inspect(fn2).wasCalledOnce()
        inspect(fn2).wasCalledWith(req, res)
      })
    })

    it('should takes multiple ctx arguments when using generators', () => {
      const fn1 = function * (req, res, next) { yield {}; req.one = 'one'; next() }
      const fn2 = function * (req, res, next) { yield {}; res.two = 'two'; next() }

      superchain.add(fn1)
      superchain.add(fn2)

      const req = {}
      const res = {}
      const result = superchain.run(req, res)
      inspect(result).isPromise()
      return result.then((out) => {
        inspect(req).isEql({
          one: 'one'
        })

        inspect(res).isEql({
          two: 'two'
        })
      })
    })

    it('should takes multiple ctx arguments when using async functions', function () {
      /* eslint-disable no-eval */
      if (!isAsyncSupported()) {
        this.test.title = `(SKIP TEST: async functions not supported by current Node version!) ${this.test.title})`
        this.skip()
        return
      }

      const fn1 = eval('(async function (req, res, next) { await {}; req.one = \'one\'; next() })')
      const fn2 = eval('(async function (req, res, next) { await {}; res.two = \'two\'; next() })')

      superchain.add(fn1)
      superchain.add(fn2)

      const req = {}
      const res = {}
      const result = superchain.run(req, res)
      inspect(result).isPromise()
      return result.then((out) => {
        inspect(req).isEql({
          one: 'one'
        })

        inspect(res).isEql({
          two: 'two'
        })
      })
    })

    it('should get an own this context', () => {
      const fn1 = sinon.spy(function (ctx, next) {
        this.one = 'one'
        next()
      })
      const fn2 = sinon.spy(function (ctx, next) {
        this.two = 'two'
        next()
      })

      superchain.add(fn1)
      superchain.add(fn2)

      const ctx = {}
      const first = superchain.run(ctx)
      inspect(first).isPromise()
      return first.then((out) => {
        inspect(fn1).wasCalledOnce()
        inspect(fn1).wasCalledWith(ctx)
        inspect(fn2).wasCalledOnce()
        inspect(fn2).wasCalledWith(ctx)

        const second = superchain.run(ctx)
        return second.then((out) => {
          inspect(fn1).wasCalledTwice()
          inspect(fn1).wasCalledWith(ctx)
          inspect(fn2).wasCalledTwice()
          inspect(fn2).wasCalledWith(ctx)

          inspect(fn1.getCall(0).thisValue).isEqual(fn2.getCall(0).thisValue)
          inspect(fn1.getCall(0).thisValue).isNotEqual(fn1.getCall(1).thisValue)
          inspect(fn2.getCall(0).thisValue).isNotEqual(fn2.getCall(1).thisValue)
        })
      })
    })

    it('should run next promise returning link on next().then()', () => {
      const fn1 = function (ctx, next) { ctx.chain.push('one'); return next().then(() => { ctx.chain.push('ten') }) }
      const fn2 = function (ctx, next) { ctx.chain.push('two'); return next().then(() => { ctx.chain.push('nine') }) }
      const fn3 = function (ctx, next) { ctx.chain.push('three'); return next().then(() => { ctx.chain.push('eight') }) }
      const fn4 = function (ctx, next) { ctx.chain.push('four'); return next().then(() => { ctx.chain.push('seven') }) }
      const fn5 = function (ctx, next) { ctx.chain.push('five'); return next().then(() => { ctx.chain.push('six') }) }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {
        chain: []
      }

      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then(() => {
        inspect(ctx.chain).isEql([
          'one', 'two', 'three',
          'four', 'five', 'six', 'seven',
          'eight', 'nine', 'ten'
        ])
      })
    })

    it('should run next async link on await next()', function testFn () {
      if (!isAsyncSupported()) {
        this.test.title = `(SKIP TEST: async functions not supported by current Node version!) ${this.test.title})`
        this.skip()
        return
      }

      const fn1 = eval('(async function (ctx, next) { ctx.chain.push(\'one\'); await next(); ctx.chain.push(\'ten\') })')
      const fn2 = eval('(async function (ctx, next) { ctx.chain.push(\'two\'); await next(); ctx.chain.push(\'nine\') })')
      const fn3 = eval('(async function (ctx, next) { ctx.chain.push(\'three\'); await next(); ctx.chain.push(\'eight\') })')
      const fn4 = eval('(async function (ctx, next) { ctx.chain.push(\'four\'); await next(); ctx.chain.push(\'seven\') })')
      const fn5 = eval('(async function (ctx, next) { ctx.chain.push(\'five\'); await next(); ctx.chain.push(\'six\') })')

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {
        chain: []
      }

      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then(() => {
        inspect(ctx.chain).isEql([
          'one', 'two', 'three',
          'four', 'five', 'six', 'seven',
          'eight', 'nine', 'ten'
        ])
      })
    })

    it('should run next callback link on return next().then()', () => {
      const fn1 = function (ctx, next) { ctx.chain.push('one'); next().then(() => { ctx.chain.push('ten') }) }
      const fn2 = function (ctx, next) { ctx.chain.push('two'); next().then(() => { ctx.chain.push('nine') }) }
      const fn3 = function (ctx, next) { ctx.chain.push('three'); next().then(() => { ctx.chain.push('eight') }) }
      const fn4 = function (ctx, next) { ctx.chain.push('four'); next().then(() => { ctx.chain.push('seven') }) }
      const fn5 = function (ctx, next) { ctx.chain.push('five'); next().then(() => { ctx.chain.push('six') }) }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {
        chain: []
      }

      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then(() => {
        inspect(ctx.chain).isEql([
          'one', 'two', 'three',
          'four', 'five', 'six', 'seven',
          'eight', 'nine', 'ten'
        ])
      })
    })
  })

  describe('when()', () => {
    let superchain

    beforeEach(() => {
      superchain = new Superchain()
    })

    it('should call a middleware only if a condition is true', () => {
      const req = {
        path: '/foo'
      }

      superchain.add((ctx, next) => {
        ctx.one = 'one'
        next()
      })

      superchain.when((ctx) => {
        return ctx.path === '/foo'
      }).add((ctx, next) => {
        ctx.two = 'two'
        next()
      })

      superchain.when((ctx) => {
        return ctx.path === '/bla'
      }).add((ctx, next) => {
        ctx.three = 'three'
        next()
      })

      superchain.add((ctx, next) => {
        ctx.four = 'four'
        next()
      })

      return superchain.run(req).then(() => {
        inspect(req).isEql({
          path: '/foo',
          one: 'one',
          two: 'two',
          four: 'four'
        })
      })
    })

    it('all subchains geting the same this context', () => {
      const req = {
        path: '/foo'
      }

      superchain.add(function (ctx, next) {
        this.one = 'one'
        next()
      })

      superchain.when(function (ctx) {
        return req.path === '/foo'
      }).add(function (ctx, next) {
        this.two = 'two'
        next()
      })

      superchain.when(function (ctx) {
        return req.path === '/bla'
      }).add((ctx, next) => {
        this.three = 'three'
        next()
      })

      superchain.add(function (ctx, next) {
        this.four = 'four'
        next()
      })

      return superchain.run(req).then((data) => {
        inspect(data).hasProps({
          one: 'one',
          two: 'two',
          four: 'four'
        })
      })
    })

    it('should share identical conditions', () => {
      const req = {
        path: '/foo'
      }

      superchain.add((ctx, next) => {
        ctx.one = 'one'
        next()
      })

      const condition = (ctx) => {
        return ctx.path === '/foo'
      }

      superchain.when(condition).add((ctx, next) => {
        ctx.two = 'two'
        next()
      })

      superchain.when(condition).add((ctx, next) => {
        ctx.three = 'three'
        next()
      })

      superchain.when((ctx) => {
        return ctx.path === '/bla'
      }).add((ctx, next) => {
        ctx.four = 'four'
        next()
      })

      superchain.add((ctx, next) => {
        ctx.five = 'five'
        next()
      })

      return superchain.run(req).then(() => {
        inspect(req).isEql({
          path: '/foo',
          one: 'one',
          two: 'two',
          three: 'three',
          five: 'five'
        })

        inspect(superchain.__chain[1]).hasKey('chain')
        inspect(superchain.__chain[1].chain.__chain).isArray().hasLength(2)
        inspect(superchain.__chain[1].chain.__chain[0]).isFunction()
        inspect(superchain.__chain[1].chain.__chain[1]).isFunction()
      })
    })
  })
})
