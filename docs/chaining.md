Chaining
========

```js
chain.add((ctx, next) => {
  ctx.chain.push('one')
  next()
})

chain.add((ctx, next) => {
  ctx.chain.push('two')
  next()
})

chain.add((ctx, next, exit) => {
  ctx.chain.push('two')
  exit()
})
```

```js
(ctx, next) => {
  ctx.chain.push('one')
  next((ctx, next) => {
    ctx.chain.push('two')
    next((ctx, next, exit) => {
      ctx.chain.push('three')
      exit()
    }))
  })).then()
})
```

Chaining with next -> then
--------------------------

```js
chain.add((ctx, next) => {
  ctx.chain.push('one')
  next().then(() => {
    ctx.chain.push('five')
  })
})

chain.add((ctx, next) => {
  ctx.chain.push('two')
  next().then(() => {
    ctx.chain.push('four')
  })
})

chain.add((ctx, next, exit) => {
  ctx.chain.push('three')
  exit()
})
```

```js
(ctx, next) => {
  ctx.chain.push('one')
  next((ctx, next) => {
    ctx.chain.push('two')
    next((ctx, next, exit) => {
      ctx.chain.push('three')
      exit() // -> stop chain
    })).then(() => {
      ctx.chain.push('four')
    })
  })).then(() => {
    ctx.chain.push('five')
  })
})
```

Chaining with async
-------------------

```js
chain.add(async (ctx, next) => {
  ctx.chain.push('one')
  await next()
  ctx.chain.push('five')
})

chain.add(async (ctx, next) => {
  ctx.chain.push('two')
  await next()
  ctx.chain.push('four')
})

chain.add(async (ctx, next, exit) => {
  ctx.chain.push('three')
  exit() // ?? required
})
```

```js
(ctx, next) => {
  ctx.chain.push('one')
  next((ctx, next) => {
    ctx.chain.push('two')
    next((ctx, next, exit) => {
      ctx.chain.push('three')
      exit() // -> stop chain
    })).then(() => {
      ctx.chain.push('four')
    })
  })).then(() => {
    ctx.chain.push('five')
  })
})
```

```js
next()
  fn.call()
    next()
      fn.call()
      exit()

done()
```

```js
next()
  fn.call()
    next()
      fn.call()
      exit()
    then()
  then()
done()
```
