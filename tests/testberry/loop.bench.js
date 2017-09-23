const testberry = require('testberry')
const inspect = require('inspect.js')

describe('loop', () => {
  it('shift items', () => {
    let arr = [
      (ctx, next) => { ctx.one = 'one'; next() },
      (ctx, next) => { ctx.two = 'two'; next() },
      (ctx, next) => { ctx.three = 'three'; next() },
      (ctx, next) => { ctx.four = 'four'; next() },
      (ctx, next) => { ctx.five = 'five'; next() }
    ]

    const ctx = {}

    arr = arr.concat(arr, arr, arr, arr, arr, arr, arr, arr, arr, arr)
    arr = arr.concat(arr, arr, arr, arr, arr, arr, arr, arr, arr, arr)

    const nextItem = () => {
      const item = arr.shift()
      if (!item) return
      item(ctx, nextItem)
    }

    testberry.test('shift items from array', () => {
      nextItem()
    })

    inspect(ctx).isEql({
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five'
    })
  })

  it('loop items', () => {
    let arr = [
      (ctx, next) => { ctx.one = 'one'; next() },
      (ctx, next) => { ctx.two = 'two'; next() },
      (ctx, next) => { ctx.three = 'three'; next() },
      (ctx, next) => { ctx.four = 'four'; next() },
      (ctx, next) => { ctx.five = 'five'; next() }
    ]

    const ctx = {}
    let i = 0

    arr = arr.concat(arr, arr, arr, arr, arr, arr, arr, arr, arr, arr)
    arr = arr.concat(arr, arr, arr, arr, arr, arr, arr, arr, arr, arr)

    const nextItem = () => {
      const item = arr[i]
      if (!item) return
      i += 1
      item(ctx, nextItem)
    }

    testberry.test('loop through array', () => {
      nextItem()
    })

    inspect(ctx).isEql({
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five'
    })
  })
})
