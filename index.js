'use strict';

const preamble = require('./lib/preamble.js');
const finisher = require('./lib/finisher.js');
const storage = require('./lib/storage.js');

const onRequestFinished = (metadata) => {
  storage.add(metadata);
};

function init (server, database, options) {
  storage.init(database, options);
  server.use(preamble);
  server.use(finisher(onRequestFinished));
}

module.exports = {
  init,
  timeline: storage.timeline,
};
