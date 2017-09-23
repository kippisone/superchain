'use strict'

const inspect = require('inspect.js')
const sinon = require('sinon')
inspect.useSinon(sinon)

const Superchain = require('../../src/Superchain')

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

      inspect(superchain.__chain).isEql([fn, fn2, fn3])
    })

    it('adds an async function to the chain', function () {
      if (!isAsyncSupported()) {
        this.test.title = ``
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

      inspect(superchain.__final).isEql([fn, fn2, fn3])
    })

    it('adds an async function to the chain', function () {
      if (!isAsyncSupported()) {
        this.test.title = ``
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
      const fn1 = (ctx, next) => { ctx.one = 'one'; next() }
      const fn2 = (ctx, next) => { ctx.two = 'two'; next() }
      const fn3 = (ctx, next) => { ctx.three = 'three'; next() }
      const fn4 = (ctx, next) => { ctx.four = 'four'; next() }
      const fn5 = (ctx, next) => { ctx.five = 'five'; next() }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {}
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).isEql({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four',
          five: 'five'
        })
      })
    })

    it('should run all chain-links, using generators', () => {
      const fn1 = function * (ctx, next) { yield {}; ctx.one = 'one'; next() }
      const fn2 = function * (ctx, next) { yield {}; ctx.two = 'two'; next() }
      const fn3 = function * (ctx, next) { yield {}; ctx.three = 'three'; next() }
      const fn4 = function * (ctx, next) { yield {}; ctx.four = 'four'; next() }
      const fn5 = function * (ctx, next) { yield {}; ctx.five = 'five'; next() }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {}
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).isEql({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four',
          five: 'five'
        })
      })
    })

    it('should run all chain-links, using async function', () => {
      const fn1 = async function (ctx, next) { await {}; ctx.one = 'one'; next() }
      const fn2 = async function (ctx, next) { await {}; ctx.two = 'two'; next() }
      const fn3 = async function (ctx, next) { await {}; ctx.three = 'three'; next() }
      const fn4 = async function (ctx, next) { await {}; ctx.four = 'four'; next() }
      const fn5 = async function (ctx, next) { await {}; ctx.five = 'five'; next() }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {}
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).isEql({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four',
          five: 'five'
        })
      })
    })

    it('should run all chain-links, using mixed functions', () => {
      const fn1 = async function (ctx, next) { await {}; ctx.one = 'one'; next() }
      const fn2 = function * (ctx, next) { yield {}; ctx.two = 'two'; next() }
      const fn3 = function (ctx, next) { ctx.three = 'three'; next() }
      const fn4 = (ctx, next) => { ctx.four = 'four'; next() }
      const fn5 = async function (ctx, next) { await {}; ctx.five = 'five'; next() }

      superchain.add(fn1)
      superchain.add(fn2)
      superchain.add(fn3)
      superchain.add(fn4)
      superchain.add(fn5)

      const ctx = {}
      const res = superchain.run(ctx)
      inspect(res).isPromise()
      return res.then((out) => {
        inspect(out).isEql({
          one: 'one',
          two: 'two',
          three: 'three',
          four: 'four',
          five: 'five'
        })
      })
    })
  })
})
