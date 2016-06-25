'use strict';

const compiler = require('./compiler.js');

module.exports = (handler) => {
  return (request, response, next) => {
    const end = response.end;
    response.end = function () {
      let headers = response.headers();
      Object.assign(response.metadata, {
        finished_at: new Date(),
        response_code: response.statusCode,
        response_type: headers['content-type'],
        response_length: headers['content-length'],
      });
      console.log('here', handler);
      end.apply(response, arguments);
      handler(compiler(response.metadata));
    };
    return next();
  };
};
