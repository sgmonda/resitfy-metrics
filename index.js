'use strict';

const preamble = require('./lib/preamble.js');
const finisher = require('./lib/finisher.js');
const storage = require('./lib/storage.js');

const onRequestFinished = (metadata) => {
  storage.add(metadata);
  storage.print();
};

function init (server) {
  server.use(preamble);
  server.use(finisher(onRequestFinished));
}

storage.timeline('2016-06-24', '2016-06-26', 'os', (error, data) => {
  console.log('OS', data);
});
storage.timeline('2016-06-24', '2016-06-26', 'route', (error, data) => {
  console.log('ROUTE', data);
});
storage.timeline('2016-06-24', '2016-06-26', 'response_code', (error, data) => {
  console.log('RESPONSE CODE', data);
});

module.exports = {
  init,
  print: storage.print,
  remove: storage.remove,
};
