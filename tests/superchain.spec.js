'use strict';

let inspect = require('inspect.js');
let superchain = require('../superchain');

describe('Superchain', function() {
  describe('instance', function() {
    it('Create a superchain instance', function() {
      inspect(superchain).isObject();
    });

    it('Should have a add() method', function() {
      inspect(superchain.add).isFunction();
    });
  });

  describe('Chain call', function() {
    it('Calls functions in series', function() {
      return superchain.add(() => {
        return 'A';
      })
      .add(() => {
        return 'B';
      })
      .add(() => {
        return 'C';
      })
      .then(result => {
        inspect(result).isEql(['A', 'B', 'C']);
      });
    });

    it('Calls promises in series', function() {
      return superchain.add(Promise.resolve('A'))
      .add(Promise.resolve('B'))
      .add(Promise.resolve('C'))
      .then(result => {
        inspect(result).isEql(['A', 'B', 'C']);
      });
    });

    it('Calls promise returning functions in series', function() {
      return superchain.add(() => {
        return Promise.resolve('A');
      })
      .add(() => {
        return Promise.resolve('B');
      })
      .add(() => {
        return Promise.resolve('C');
      })
      .then(result => {
        inspect(result).isEql(['A', 'B', 'C']);
      });
    });
  });

  describe('Chain call fail', function() {
    it('Calls functions in series, second fails', function() {
      return superchain.add(() => {
        return 'A';
      })
      .add(() => {
        throw new Error('B failed!');
      })
      .add(() => {
        return 'C';
      })
      .then(result => {
        inspect(result).isEql(['A', 'B', 'C']);
      })
      .catch(err => {
        return err;
      })
      .then(err => {
        inspect(err).isInstanceOf(Error);
        inspect(err.message).isEql('B failed!');
      });
    });

    it('Calls promises in series, second fails', function() {
      return superchain.add(Promise.resolve('A'))
      .add(Promise.reject('B failed!'))
      .add(Promise.resolve('C'))
      .then(result => {
        inspect(result).isEql(['A', 'B', 'C']);
      })
      .catch(err => {
        return err;
      })
      .then(err => {
        inspect(err).isString();
        inspect(err).isEql('B failed!');
      });
    });

    it('Calls promise returning functions in series', function() {
      return superchain.add(() => {
        return Promise.resolve('A');
      })
      .add(() => {
        return Promise.reject('B failed!');
      })
      .add(() => {
        return Promise.resolve('C');
      })
      .then(result => {
        inspect(result).isEql(['A', 'B', 'C']);
      })
      .catch(err => {
        return err;
      })
      .then(err => {
        inspect(err).isString();
        inspect(err).isEql('B failed!');
      });
    });
  });
});
