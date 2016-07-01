'use strict';

const restify = require('restify');
const metrics = require('../index.js');

const PORT = 8081;

var server = restify.createServer({
  name: 'Example',
});
var database = {
  host: 'localhost',
  port: 27017,
  database: 'test',
  user: 'test',
  password: 'test',
};

metrics.init(server, database, {debug: true});

let handler = (request, response) => {
	setTimeout(() => {
		response.send(503);
	}, Math.random() * 3 * 1000);
};

server.get('/hello/:id/world', handler);
server.post(/.*/, handler);

server.listen(PORT);
console.log(`Server listening on ${PORT}`);
