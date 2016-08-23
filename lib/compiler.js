'use strict';

const moment = require('moment');

exports.request = (metadata) => {
	var date = moment(metadata.started_at).utc().startOf('minute');
	metadata.duration = metadata.finished_at - metadata.started_at;
	metadata.date = date.toDate();
	return metadata;
};

exports.timeline = (list) => {
	console.log('COMPILE', list);
	let timeline = {};
	list.forEach(item => {
		let ts = date(item._id);
		timeline[ts] = timeline[ts] || {};
		timeline[ts].count = item.count;
		timeline[ts].max = item.max;
		timeline[ts].min = item.min;
		timeline[ts].avg = item.avg;
	});
	return timeline;
};

function date (data) {
	let ts = Date.UTC(data.year, data.month - 1, data.day, data.hour || 0, data.minute || 0);
	return new Date(ts).toISOString();
}
