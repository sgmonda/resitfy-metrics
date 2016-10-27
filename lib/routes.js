'use strict';

const DICTIONARY = require('./dictionary');
const storage = require('./storage.js');
const moment = require('moment');
const url = require('url');
const gensy = require('gensy');

exports.init = (server, options) => {
	let endpoint = options.endpoint || 'perboard';
	server.get('/' + endpoint + '/dictionary', dictionary);
	server.get('/' + endpoint + '/drilldown/:variable', drilldown);
	server.get('/' + endpoint + '/timeline/:variable', timeline);
	server.get('/' + endpoint + '/summary', summary);
};

function dictionary (request, response) {
	response.send(DICTIONARY);
}

function drilldown (request, response) {
	let query = url.parse(request.url, true).query;
	let variable = request.params.variable;
	storage.drilldown(query.from, query.to, variable, (error, data) => {
		if (error) {
			console.warn('ERROR', error);
			return response.send(500);
		}
		response.send(data);
	});
}

function timeline (request, response) {
	let query = url.parse(request.url, true).query;
	let from = moment(query.from).utc().toISOString();
	let to = moment(query.to).utc().toISOString();
	let resolution = query.resolution || 'minute';
	let metrics = query.metrics.split(',');
	gensy(function* (next) {
		try {
			let variables = request.params.variable.split(',');
			let timelines = {};
			for (let variable of variables) {
				let data = yield storage.timeline(from, to, resolution, variable, metrics, next);
				timelines[variable] = data;
			}
			return response.send(timelines);
		} catch (error) {
			console.warn('ERROR', error);
			return response.send(500);
		}
	});
}

function summary (request, response) {
	let query = url.parse(request.url, true).query;
	let from = moment(query.from).utc();
	let to = moment(query.to).utc();
	let seconds = (to - from) / 1000;
	storage.summary(from, to, (error, data) => {
		if (error) {
			console.warn('ERROR', error);
			return response.send(500);
		}
		let summary = {
			request_per_second: round(data.count / seconds),
			request_length: round(data.request_length) + ' bytes',
			response_time: round(data.response_time) + ' ms',
			response_length: round(data.response_length) + ' bytes',
			error_ratio: round(data.error_count / data.count) + ' %',
		};
		response.send(summary);
	});
}

function round (number) {
	return number.toFixed(2).replace('.00', '');
}
