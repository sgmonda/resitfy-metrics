'use strict';

const DICTIONARY = require('./dictionary');
const storage = require('./storage.js');
const moment = require('moment');
const url = require('url');

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
		if (error) return response.send(500);
		response.send(data);
	});
}

function timeline (request, response) {
	let query = url.parse(request.url, true).query;
	let from = moment(query.from).utc().toISOString();
	let to = moment(query.to).utc().toISOString();
	let resolution = query.resolution || 'minute';
	storage.timeline(from, to, resolution, request.params.variable, (error, data) => {
		if (error) return response.send(500);
		response.send(data);
	});
}

function summary (request, response) {
	let query = url.parse(request.url, true).query;
	let from = moment(query.from).utc();
	let to = moment(query.to).utc();
	let seconds = (to - from) / 1000;
	storage.summary(from, to, (error, data) => {
		if (error) return response.send(500);
		let summary = {
			request_per_second: round(data.count / seconds),
			response_time: round(data.response_time) + ' ms',
			response_length: round(data.response_length) + ' bytes',
			percentage_error: 1.6,
		};
		response.send(summary);
	});
}

function round (number) {
	return number.toFixed(2).replace('.00', '');
}
