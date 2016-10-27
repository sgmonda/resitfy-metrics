'use strict';

var restify = require('restify');
var metrics = require('../index.js');

var PORT = 8081;

var server = restify.createServer({
  name: 'Example',
});
var database = {
  host: '192.168.99.100',
  port: 27017,
  database: 'test',
  user: 'test',
  password: 'test',
};

metrics.init(server, database, {debug: true, endpoint: 'example'});

var handler = function (request, response) {
	setTimeout(function() {
		response.send(200, 'hello');
	}, Math.random() * 3 * 1000);
};

server.get('/hello/:id/world', handler);
server.post(/.*/, handler);
server.put(/.*/, handler);

server.listen(PORT);
console.log('Server listening on', PORT);
