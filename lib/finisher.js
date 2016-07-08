import compiler from './compiler';

module.exports = (handler) => {
  return (request, response, next) => {
    const end = response.end;
    response.end = function () {
      complete(response);
      end.apply(response, arguments);
      handler(compiler.request(response.metadata));
    };
    return next();
  };
};

function complete (response) {
  let headers = response.headers();
  let aux = {
    finished_at: new Date(),
    response_code: response.statusCode,
    response_type: headers['content-type'],
    response_length: headers['content-length'],
  };
  for (let key in aux) {
    response.metadata[key] = aux[key];
  }
}
