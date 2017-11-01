# Superchain

[![Build Status](https://travis-ci.org/Andifeind/superchain.svg?branch=master)](https://travis-ci.org/Andifeind/superchain)

Superchain is a high performant middleware chain.  
Each chain-link calls the next one until the end of the chain was reached.

```js
import Superchain from 'superchain'

const chain = new Superchain()

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


// run the chain
const result = chain.run(ctx)

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

const chain = new Superchain()

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

// run the chain
const result = chain.run(ctx)
result
  .then((ctx) => {

  })
  .catch((err) => {

  })

```

#### Multiple arguments

Pass multiple arguments to `run()` and each middleware gets all of it.

```js
import Superchain from 'superchain'

const chain = new Superchain()

// add a middleware function
chain.add(async function (req, res, next) {
  // do some fancy stuff here
  await something()
  next()
})

// run the chain
chain.run(ctx)
```


#### This context

Each middleware has the same `this` context. An empty object is passed when chain starts. It could be used to transport data between middlewares. The final promise returns the `this` context. Don't forget, arrow functions don't bind its own `this` context. Use normal functions instead if you need access to it.

```js
import Superchain from 'superchain'

const chain = new Superchain()

// add a middleware function
chain.add(async function (req, res, next) {
  this.foo = 'foo'
  next()
})

chain.add(async function (req, res, next) {
  this.bar = 'bar'
  next()
})

// run the chain
chain.run(ctx).then((ctx) => {
  // ctx === {
  //   foo: 'foo',
  //   bar: 'bar'
  // }
})
```

#### Final promise

The `run()` method returns a promise. If you're using the callback style and do not call `next()` the chain will stop and no promise will be called. In that case, you have to call `finish()` which is the last argument. This is the only way to get notified when a callback has done its job. The `finish` argument is not available in `generators` or `async functions`.

```js
import Superchain from 'superchain'

const chain = new Superchain()

chain.add((req, res, next, finish) => {
  next()
})

chain.add((req, res, next, finish) => {
  finish() // cancel the chain and call the final promise
})

chain.add((req, res, next, finish) => {
  // never gets called
})

// run the chain
chain.run(ctx).then((ctx) => {
  // called after second middleware
})
```

Calling `finish()` is only necessary when you use the final promise.


#### Error handling

Whenever an error was thrown the promise gets rejected and the chain is canceled.

```js
import Superchain from 'superchain'

const chain = new Superchain()

// add a middleware function
chain.add(async function (ctx, next) {
  throw new Error('Something went wrong :(')
  next()
})

chain.add(async function (ctx, next) {
  // get not called
  next()
})

// run the chain
const result = chain.run(ctx)
result
  .then((ctx) => {
    // will not be called
  })
  .catch((err) => {
    // chain was canceled after first item
  })

```

#### Conditions

Each middleware can have one condition function. The middleware gets called when the condition returns true otherwise it'll be skipped.

```js
import Superchain from 'superchain'

const chain = new Superchain()

const condition = (ctx) => {
  return /^\/foo/.test(ctx.path)
}

chain.when(condition).add(async function (ctx, next) {
  // it'll only be called when ctx.path starts with /foo
  next()
})

chain.add(async function (ctx, next) {
  // get not called
  next()
})

// run the chain
const result = chain.run(ctx)
result
  .then((ctx) => {
    // will not be called
  })
  .catch((err) => {
    // chain was canceled after first item
  })

```

### Bucket chain

A Bucketchain is a chain of buckets, each bucket contains one chain.
Whenever a bucket chain starts, it runs the chain from first bucket and refers then to the second bucket. If any error occurs, the chain is canceld and the final promise gets rejected.

```js
import { Bucketchain } from 'superchain'

const bucketchain = new Buckecchain()
const fooBucket = bucketchain.bucket('fooBucket')
const barBucket = bucketchain.bucket('barBucket')

fooBucket.add(async function () {
  this.output = ['one']
})

barBucket.add(async function () {
  this.output.push('two')
})

fooBucket.add(async function () {
  this.output = ['three']
})

const result = bucketchain.run()
result
  .then((ctx) => {
    // ctx.output === ['one', 'three', 'two']
  })
  .catch((err) => {
    // called when any error happens
  })
```

### Next chain

```js
chain.add(async (ctx, next) => {
  console.log('One')
  await next()
  console.log('Five')
})

chain.add(async (ctx, next) => {
  console.log('Two')
  next()
  console.log('Four')
})

chain.add(async (ctx, next) => {
  console.log('Three')
})
```

### Debugging

Superchain has a simple debugging mode. Enable it by setting debug to `true`

```js
const chain = new Superchain()
chain.debug = true

// or for a Bucketchan

const chain = new Bucketchain()
chain.debug = true
```
