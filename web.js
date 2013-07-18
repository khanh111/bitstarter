var express = require('express'),
  fs = require('fs');
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
 var indexBuffer = fs.readFileSync('index.html');

    response.send(indexBuffer.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
