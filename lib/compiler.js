'use strict';

const moment = require('moment');

exports.request = function (metadata) {
  var date = moment(metadata.started_at).utc().startOf('minute');
  metadata.duration = metadata.finished_at - metadata.started_at;
  metadata.date = date.toDate();
  return metadata;
};

exports.timeline = function (list) {
  let timeline = {};
  for (let item of list) {
    let ts = date(item._id);
    timeline[ts] = timeline[ts] || {};
    timeline[ts][item._id.value] = item.count;
  }
  return timeline;
};

function date (data) {
  let ts = Date.UTC(data.year, data.month - 1, data.day, data.hour || 0, data.minute || 0);
  return new Date(ts).toISOString();
}
