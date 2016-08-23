'use strict';

const preamble = require('./preamble');
const finisher = require('./finisher');
const storage = require('./storage');
const routes = require('./routes');
const dashboard = require('./dashboard');

const DEFAULT_ENDPOINT = 'perboard';
const onRequestFinished = (metadata) => storage.add(metadata);

exports.init = (server, database, options) => {
	options.endpoint = options.endpoint || DEFAULT_ENDPOINT;
	dashboard.init(server, options);
	storage.init(database, options);
	server.use(preamble);
	server.use(finisher(onRequestFinished));
	routes.init(server, options);
};
