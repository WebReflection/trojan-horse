// test via node index.js

var trojanHorse = require('./trojan-horse');
var index = require('fs').readFileSync('./test.html');

// for demo purpose, we set an allowed list of callbacks that can be executed
// if not present or empty, every callback would be executable.
// To create a nonce use trojanHorse.createNonce(callback);
// You can name nonces using a semicolon before the actual nonce
trojanHorse.nonces = [
  "os-info:ebcf12c8e5775a755cc0cbe03a658cd5002b172af3316027dc66907b995c77c0",
  "serverCommand:b51a2398a303ca88c997e45f9c909bb68af40c618be7d5c9a8e15d9d09f59d13"
];

console.log('visit http://localhost:7357/');

require("http")
  .createServer(function (request,  response) {
    // handle the request only if it wasn't a trojanHorse
    if (!trojanHorse(request,  response)) {
      response.writeHead(200, 'OK', {'Content-Type': 'text/html'});
      response.end(/^\/(?:index\.html)?$/.test(request.url) ? index : '');
    }
  })
  .listen(7357)
;