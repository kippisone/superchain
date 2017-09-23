# Superchain

[![Build Status](https://travis-ci.org/Andifeind/superchain.svg?branch=master)](https://travis-ci.org/Andifeind/superchain)

Superchain is a high performant middleware chain.  
Each chain-link calls the next one until the end of the chain was reached.

```js
import Superchain from 'superchain'

const chain = new Superchain({
  timeout: 10000
})

// add a middleware function
chain.add((ctx, next) => {
  // do some fancy stuff here
  next()
})

chain.add((ctx, next) => {
  // next middleware
  next()
})

// add a final function
chain.final((ctx, next) => {
  next()
})


// start the chain
const result = chain.start(ctx)

// result is a promise
result
  .then((ctx) => {

  })
  .catch((err) => {

  })

```

The example above creates a chain with 3 items. Each item gets the same context object and calls the next chain-link. The final handler gets called as last one.

Not only `callback functions` are supported. You deal with asynchronous code? Then use `generators` or `async functions`. We use [co](https://www.npmjs.com/package/co) to execute generators.
Look at to their documentation to know more about generators.

```js
import Superchain from 'superchain'

const chain = new Superchain({
  timeout: 10000
})

// add a middleware function
chain.add(async function (ctx, next) {
  // do some fancy stuff here
  await something()
  next()
})

chain.add(function * (ctx, next) {
  // next middleware
  yield something()
  next()
})

// start the chain
const result = chain.start(ctx)
result
  .then((ctx) => {

  })
  .catch((err) => {

  })

```

#### Error handling

Whenever an error was thrown the promise gets rejected and the chain is canceled.

```js
import Superchain from 'superchain'

const chain = new Superchain({
  timeout: 10000
})

// add a middleware function
chain.add(async function (ctx, next) {
  throw new Error('Something went wrong :(')
  next()
})

chain.add(async function (ctx, next) {
  // get not called
  next()
})

// start the chain
const result = chain.start(ctx)
result
  .then((ctx) => {
    // will not be called
  })
  .catch((err) => {
    // chain was canceled after first item
  })

```
