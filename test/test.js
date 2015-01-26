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

describe('endpoint', function () {
  var data;

  beforeEach(function () {
    mockApi()
      .get('/search?q=hello')
      .reply(200, { result: 'ok' });
  });

  beforeEach(function (next) {
    var search = Api.endpoint('GET', '/search{?q}');
    return search({ q: 'hello' })
      .then(function (d) { data = d; next(); });
  });

  it('works', function () {
    expect(data.result).eql('ok');
  });
});
