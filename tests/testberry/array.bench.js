'use strict'

const testberry = require('testberry')
const inspect = require('inspect.js')

describe('Array', () => {
  it('concaternation', () => {
    const arr = ['one', 'two']
    const arr2 = ['three', 'four']
    let res

    testberry.test('.concat()', () => {
      res = [].concat(arr, arr2)
    })

    inspect(res).isEql(['one', 'two', 'three', 'four'])
  })
})
