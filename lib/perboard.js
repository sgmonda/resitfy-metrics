import preamble from './preamble';
import finisher from './finisher';
import storage from './storage';
import routes from './routes';
import dashboard from './dashboard';

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
