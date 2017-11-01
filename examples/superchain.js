const Superchain = require('../')

const chain = new Superchain()
chain.debug = true

chain.add(function firstLink (ctx, next) {
  next()
})

chain.add(function secondLink (ctx, next) {
  next()
})

chain.add(function thirdLink (ctx, next) {
  next()
})

chain.final(function finalLink (ctx, next) {
  next()
})

const ctx = {}
const result = chain.run(ctx)

result.then(() => {
  console.log('Chain finished!')
}).catch((err) => {
  console.log('Chain error!', err)
})
