const moment = require('moment');

module.exports = function (metadata) {
  var date = moment(metadata.started_at).utc();
  metadata.duration = metadata.finished_at - metadata.started_at;
  metadata.date = date.format('YYYY-MM-DD HH:mm');
  return metadata;
};
