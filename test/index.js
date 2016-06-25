'use strict';

const restify = require('restify');
const metrics = require('../index.js');

const PORT = 8081;

var server = restify.createServer({
  name: 'Example',
});

metrics.init(server);

let handler = (request, response) => {
	setTimeout(() => {
		response.send(503);
	}, Math.random() * 3 * 1000);
};

server.get('/hello/:id/world', handler);
server.post(/.*/, handler);

server.listen(PORT);
console.log(`Server listening on ${PORT}`);

process.on('SIGINT', () => {
  metrics.print();
  process.exit(1);
});
