const Superchain = require('./Superchain')
const Bucketchain = require('./Bucketchain')

module.exports = function SuperchainFactory () {
  return new Superchain()
}

module.exports.Bucketchain = Bucketchain
module.exports.Superchain = Superchain
