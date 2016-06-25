'use strict';

const useragent = require('useragent');

module.exports = (request, response, next) => {
  let headers = request.headers;
  let ua = useragent.lookup(headers['user-agent']);
  response.metadata = {
    method: request.method,
    url: request.url,
    route: request.route.path,
    params: params(request.params),
    query: request.query(),
    request_length: headers['content-length'],
    request_type: headers['content-type'],
    os: ua.os.family,
    started_at: new Date(),
  };
  return next();
};

function params (map) {
  var parts = [];
  for (let key in map) {
    parts.push(`${key}=${map[key]}`);
  }
  return parts.join(',');
}
