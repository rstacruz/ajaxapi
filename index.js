/*
 * API
 */

function Api (config) {
  if (!(this instanceof Api))
    return new Api(config);

  if (typeof config === 'string') config = { base: config };
  else if (!config) config = {};

  this.base = config.base;
  this._after = [];
  this._before = [];
  this.response = null;
}

/*
 * Api.request() : Api.request(...)
 * ThenRequest instance. See http://npmjs.com/then-request
 */

Api.request = require('then-request');

/**
 * Api.expand() : Api.expand(template, data)
 * Expands a URL template.
 *
 *     API.expand('/get/{user}', { user: 'john' })
 *     => "/get/john"
 */

/*
 * request() : request(method, url, [data])
 * Performs a request.
 */

Api.prototype.request = function (method, url, data) {
  var options = { headers: {}, qs: {}, json: (data || {}) };

  var context = {
    method: method,
    url: this.prefix(url),
    data: data,
    headers: options.headers,
    options: options
  };

  // apply before hooks (custom)
  this._before.forEach(function (fn) { fn.call(this, context); });

  // promise
  var pro = Api.request(
    context.method,
    context.url,
    context.options);

  // apply after hooks (defaults)
  pro = pro
    .then(this.catchCorsError.bind(this))
    .then(this.saveResponse.bind(this))
    .then(this.parseBody.bind(this));

  // apply after hooks (custom)
  this._after.forEach(function (callbacks) {
    pro = pro.then(proxy(callbacks[0]), proxy(callbacks[1]));
  });

  function proxy (fn) {
    return fn ? fn.bind(this) : null;
  }

  return pro;
};

/*
 * aliases
 */

Api.prototype.get = buildAlias('GET');
Api.prototype.put = buildAlias('PUT');
Api.prototype.del = buildAlias('DELETE');
Api.prototype.post = buildAlias('POST');
Api.prototype.patch = buildAlias('PATCH');

/*
 * currying helper to make alias methods
 */

function buildAlias (method) {
  return function () {
    return Api.prototype.request.apply(this,
      [method].concat([].slice.call(arguments)));
  };
}

/*
 * add before hook
 */

Api.prototype.before = function (fn) {
  this._before.push(fn);
  return this;
};

/*
 * add after hook
 */

Api.prototype.after = function (okFn, errFn) {
  this._after.push([ okFn, errFn ]);
  return this;
};

/*
 * parses the body
 *
 *     parseBody({
 *       body: '{"name":"Joe"}',
 *       headers: { 'content-type': 'application/json' }
 *     })
 *     => { name: "Joe" }
 */

Api.prototype.parseBody = function (res) {
  var
    body = res.getBody(),
    type = res.headers['content-type'];

  if (type && type.match(/^application\/json/))
    return JSON.parse(body);
  else
    return body;
};

/*
 * prefixes a url with the base
 */

Api.prototype.prefix = function (url) {
  if (url[0] === '/')
    return (this.base || '') + url;
  else
    return url;
};

/*
 * (internal) saves responses
 */

Api.prototype.saveResponse = function (res) {
  this.response = this.res = res;
  return res;
};

/*
 * (internal) catches cross origin request errors
 */

Api.prototype.catchCorsError = function (res) {
  if (res && res.statusCode === 0)
    throw new Error("API failed due to cross-origin error");
  return res;
};

/*
 * export
 */

module.exports = Api;
