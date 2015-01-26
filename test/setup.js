global.expect = require('chai').expect;
global.nock = require('nock');
global.Ajax = require('../index');
global.Api = null;

beforeEach(function () {
  Api = Ajax('http://api.github.com');
});

afterEach(function () {
  nock.cleanAll();
});

global.mockApi = function() {
  return nock('http://api.github.com');
};

global.errExpected = function () {
  throw new Error("Error was expected out of a promise");
};
