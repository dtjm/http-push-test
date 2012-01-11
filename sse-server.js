var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {
  var t = null;
  if (req.url === '/events') {

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write(':' + Array(2049).join(' ') + '\n'); //2kb padding for IE
    res.write('data: ' + Date() + '\n\n');

    t = setInterval(function () {
      res.write('data: ' + Date() + '\n\n');
    }, 1000);

    res.socket.on('close', function () {
      clearInterval(t);
    });


  } else {
    if (req.url === '/sse-index.html' || req.url === '/eventsource.js') {
      res.writeHead(200, {'Content-Type': req.url === '/sse-index.html' ? 'text/html' : 'text/javascript'});
      res.write(fs.readFileSync(__dirname + req.url));
    }
    res.end();
  }
}).listen(8081); //! port :8081

