# ajaxapi

minimal ajax library.

- optimized for consuming restful api's
- small and compact (< 6kb gzipped)
- uses promises
- supports node.js and the browser

```js
var ajaxapi = require('ajaxapi');

var API = ajaxapi('https://api.github.com');

API.get('/repo/iojs/io.js')
  .then(function (data) {
    alert("Stars: " + data.stargazers_count);
  })

API.put('/user', { name: 'John Constantine' })
  .then(function (data) {
    alert("User data was saved");
  });
```

<br>

## Customization

### Before hooks

Hooks before its sent

```js
var API = ajaxapi('https://api.github.com');

API.before(function (ctx) {
  ctx.headers['X-Access-Token'] = '...';

  ctx.headers   //=> {}
  ctx.method    //=> "GET"
  ctx.url       //=> "https://api.github.com/foo/bar"
  ctx.data      //=> {}
});
```

### After hooks

Promise stuff -- to be appended to the chain via `.then()` after the body is
parsed.

These hooks will be chaining each other.

```js
var API = ajaxapi('https://api.github.com');

API.after(function (data) {
  // do stuff
  API.response.headers
  API.response.statusCode

  return data;
});
```
