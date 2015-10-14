# trojan-horse
Execute nodejs through the browser (what could possibly go wrong)


#### WARNING
If used improperly this module can give access to every sort of malicious code.
It is possible to reboot, shutdown, format an entire disk or who knows what else.
Use at your own risk and **read about nounces** to improve security.


### WUT?
Using `trojanHorse` as `express` middle layer or any generic node `req, res` handler gives the browser the ability to execute JavaScript code remotely on the server.
```js
// nodejs exammple
var trojanHorse = require('./trojan-horse');
require("http")
  .createServer(function (request,  response) {
    // in case this is a trojan-horse request GTFO
    if (trojanHorse(request,  response)) return;
    // in every other case we can simply do
    // whatever we usually do with requests
  })
  .listen(1337)
;

// express
var trojanHorse = require('./trojan-horse');
app.use('/.trojan-horse.js', trojanHorse);
app.use('/.trojan-horse', trojanHorse);
```

On the client side, the minimum amount of required code would look like the following:
```html
<!doctype html>
<script src="/.trojan-horse.js">/* grab the constructor */</script>
<script>
var th = new TrojanHorse();
th.exec(function () {
  console.log('Hello from the client');
  resolve();
});
</script>
```


### Allowing execution via nonces
Unless the running server is not reachable from external browsers and unless we are in a very secure and trusted environment, it is really not recommended to accept any sort of function execution in the wild.

In order to allow only well known functions, it is possible to define one or more `nonces` which are a `sha256` representation of cleaned up functions.

```js
var trojanHorse = require('./trojan-horse');

// to create a named nonce ... 
trojanHorse.createNonce('cpus', function () {
  // will return cpus info
  resolve(require('os').cpus());
});

// 'cpus:c501c5c77cb24c0d9d7a05e94e9dc9254650afee8c249f7aa283e1061c62846b'

```
Since security is a major concern here, `nonces` can be defined only once per application lifetime, meaning that all privileged functions must be known upfront or `trojan-horse` will throw an error.

```js
// main appication  file
var trojanHorse = require('./trojan-horse');
// define one or more nonces here once per appllication
trojanHorse.nonces = [
  'cpus:c501c5c77cb24c0d9d7a05e94e9dc9254650afee8c249f7aa283e1061c62846b',
  // eventually other nonces too ...
];

// rest of the app
require('http').createServer ...
```


### HOW
The entire logic is based on Promise, AJAX, and normalized function decompilation. There is no way an executed function can access the client-side outer scope: it will be sent as string and evaluated through the nodejs `vm` module in a stateless way, or in a specific context.

```js
// client side JS, executed from the browser
// trojan with persistent global context

(new TrojanHorse).createEnv().then(function (th) {
  // each exec will run in the same sandbox
  th.exec(function () {
    if (!global.i) i = 0;
    resolve(++i);
  }).then(function (i) {
    alert('now it is ' + i);
    th.exec(function () {
      resolve(++i);
    }).then(function (i) {
      alert('and now it is ' + i);
    });
  });
});
```

Every time a function is executed on the server it will have access to a `resolve` and a `reject` callback.
Once executed, these will terminate the request and eventually send the result (or the error).

Every returned variable must be `JSON` compatible, and it is also possible to send to the server arbitrary arguments that must be compatible with `JSON` too.

```js
// execute sending arguments
th.exec([1, 2, 3], function (one,  two, three) {
  resolve(one + two + three);
});
```


### Examples and Demos
The [base.js](base.js) files contain the most basic playground while [test.js](test.js) and [test.html](test.html) contain a nonces based example. Change one of those two functions to see them failing.



### MIT License
```
Copyright (C) 2015 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
