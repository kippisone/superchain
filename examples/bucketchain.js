const Bucketchain = require('../').Bucketchain

const chain = new Bucketchain()
chain.debug = true

const firstBucket = chain.bucket('firstBucket')
const secondBucket = chain.bucket('secondBucket')
const thirdBucket = chain.bucket('thirdBucket')

firstBucket.add(function firstLink (ctx, next) {
  next()
})

secondBucket.add(function secondLink (ctx, next) {
  next()
})

thirdBucket.add(function thirdLink (ctx, next) {
  next()
})

thirdBucket.final(function finalLink (ctx, next) {
  next()
})

const result = chain.run()

result.then(() => {
  console.log('Chain finished!')
}).catch((err) => {
  console.log('Chain error!', err)
})
