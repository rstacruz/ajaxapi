var URI = require('uri-template-lite').URI;

module.exports = function (config) {
  return new Api(config);
};

/*
 * API
 */

function Api (config) {
  if (typeof config === 'string') config = { base: config };
  else if (!config) config = {};

  this.base = config.base;
  this._after = [];
  this._before = [];
  this.response = null;
}

/*
 * ThenRequest
 */

Api.request = require('then-request');

/*
 * expand a URL tempalte
 */

Api.expand = URI.expand;

/*
 * Performs a request
 */

Api.prototype.request = function (method, url, data) {
  var context = {
    method: method,
    url: this.prefix(url),
    data: data,
    options: {}
  };

  // apply before hooks (custom)
  this._before.forEach(function (fn) { fn.call(this, context); });

  // promise
  var pro = Api.request(
    context.method,
    context.url,
    context.options);

  // apply after hooks (defaults)
  pro = pro.then(this.parseBody);

  // apply after hooks (custom)
  this._after.forEach(function (callbacks) {
    pro = pro.then(callbacks[0].bind(this), callbacks[1].bind(this));
  });

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

  if (type.match(/^application\/json/))
    return JSON.parse(body);
  else
    return body;
};

/*
 * endpoint
 */

Api.prototype.endpoint = function (method, template) {
  var self = this;
  return function (uridata, data) {
    var url = Api.expand(template, uridata);
    return self.request(method, url, data);
  };
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
