'use strict';

const compiler = require('./compiler.js');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');

const COLLECTION = 'metrics_requests';
const DELAY_MS = 1000 * 5;

var collection = null;
var buffer = [];
var debug = false;

const log = (message) => {
	if (debug) console.log(message);
};

const flush = _.throttle(() => {
	log('Metrics buffer flush');
	collection.insertMany(buffer, (error) => {
		if (error) throw error;
		buffer = [];
	});
}, DELAY_MS);

exports.init = (database, options) => {
	debug = options.debug;
	let url = `mongodb://${database.user}:${database.password}@${database.host}:${database.port}/${database.database}`;
	MongoClient.connect(url, (error, db) => {
		if (error) throw error;
		database = db;
		collection = db.collection(COLLECTION);
		log(`Connected to ${url}`);
	});
};

exports.add = (item) => {
	if (!collection) throw new Error('No connected to MongoDB');
	buffer.push(item);
	log(`${buffer.length} metrics buffered until next flush.`);
	flush();
};

exports.timeline = (from, to, resolution, variable, metrics, callback) => {
	if (!collection) throw new Error('No connected to MongoDB');
	let $project = time(resolution);
	$project[variable] = '$' + variable;
	let $group = {
		_id: {year: '$year', month: '$month', day: '$day', hour: '$hour', minute: '$minute'},
	};
	console.log('METRICS', metrics);
	if (metrics.indexOf('count') !== -1) $group.count = {$sum: 1};
	for (let metric of ['min', 'max', 'avg']) {
		if (metrics.indexOf(metric) !== -1) {
			let key = `$` + metric;
			$group[metric] = {};
			$group[metric][key] = '$' + variable;
		}
	}
	let query = [{
		$match: {date: {$gte: moment(from).utc().toDate(), $lte: moment(to).utc().toDate()}},
	}, {
		$project,
	}, {
		$group,
	}];
	console.log($group);
	collection.aggregate(query).toArray((error, data) => {
		if (error) throw error;
		var compiled = compiler.timeline(data);
		callback(null, compiled);
	});
};

function time (resolution) {
	let group = {
		minute: {$minute: '$date'},
		hour: {$hour: '$date'},
		day: {$dayOfMonth: '$date'},
		month: {$month: '$date'},
		year: {$year: '$date'},
	};
	if (/^hour/.test(resolution)) {
		delete group.minute;
	} else if (/^day/.test(resolution)) {
		delete group.minute;
		delete group.hour;
	}
	return group;
}

exports.drilldown = (from, to, variable, callback) => {
	let query = [{
		$match: {date: {$gte: moment(from).utc().toDate(), $lte: moment(to).utc().toDate()}},
	}, {
		$group: {
			_id: {value: '$' + variable, year: '$year', month: '$month', day: '$day', hour: '$hour', minute: '$minute'},
			count: {$sum: 1},
		},
	}];
	collection.aggregate(query).toArray((error, data) => {
		if (error) throw error;
		let drilldown = {};
		data.forEach(item => drilldown[item._id.value] = item.count);
		callback(null, drilldown);
	});
};

exports.summary = (from, to, callback) => {
	let query = [{
		$match: {date: {$gte: moment(from).utc().toDate(), $lte: moment(to).utc().toDate()}},
	}, {
		$project: {
			response_time: {$subtract: ['$finished_at', '$started_at']},
			response_length: '$response_length',
			error: {$cond: {if: {$gte: ['$response_code', 500]}, then: 1, else: 0}},
			success: {$cond: {if: {$lt: ['$response_code', 500]}, then: 1, else: 0}},
		},
	}, {
		$group: {
			_id: '$item',
			count: {$sum: 1},
			response_time: {$avg: '$response_time'},
			response_length: {$avg: '$response_length'},
			error_count: {$sum: '$error'},
			success_count: {$sum: '$success'},
		},
	}];
	collection.aggregate(query, (error, data) => {
		if (error) throw error;
		callback(null, data[0]);
	});
};
