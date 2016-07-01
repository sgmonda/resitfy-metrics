'use strict';

const preamble = require('./lib/preamble.js');
const finisher = require('./lib/finisher.js');
const storage = require('./lib/storage.js');
const routes = require('./lib/routes.js');
const dashboard = require('./lib/dashboard.js');

const onRequestFinished = (metadata) => {
  storage.add(metadata);
};

exports.init = (server, database, options) => {
  storage.init(database, options);
  server.use(preamble);
  server.use(finisher(onRequestFinished));
  routes.init(server);
  dashboard.init(server);
};
