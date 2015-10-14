// run via `node base.js`
var trojanHorse = require('./trojan-horse');
require("http")
  .createServer(function (request,  response) {
    if (!trojanHorse(request,  response)) {
      response.writeHead(200, 'OK', {'Content-Type': 'text/html'});
      response.end(''.concat(
        '<!doctype html>',
        '<script src="/.trojan-horse.js">/* grab the constructor */</script>',
        '<script>(new TrojanHorse).exec(',
          // trojan-horse is based on function decompilation
          function () {
            console.log('Hello from the client');
            resolve('Hi client, here server!');
          },
        ');</script>'
      ));
    }
  })
  .listen(1337)
;
console.log('visit http://localhost:1337/');