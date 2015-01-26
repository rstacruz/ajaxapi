require('./setup');

describe('200', function () {
  var data;

  beforeEach(function () {
    mockApi()
      .get('/repos/iojs/io.js')
      .reply(200, { name: 'io.js' });
  });

  beforeEach(function (next) {
    return Api.get('/repos/iojs/io.js')
      .then(function (d) { data = d; next(); });
  });

  it('works', function () {
    expect(data.name).eql('io.js');
  });
});

describe('404', function () {
  beforeEach(function () {
    mockApi()
      .get('/repos/iojs/io.js')
      .reply(404);
  });

  it('has statuscode', function () {
    return Api.get('/repos/iojs/io.js')
      .then(errExpected, function (err) {
        expect(err.statusCode).eql(404);
      });
  });
});
