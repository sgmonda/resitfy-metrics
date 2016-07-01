'use strict';

const DICTIONARY = require('./dictionary');
const storage = require('./storage.js');
const moment = require('moment');
const url = require('url');

exports.init = (server) => {
  server.get('/perboard/dictionary', dictionary);
  server.get('/perboard/drilldown/:variable', drilldown);
  server.get('/perboard/timeline/:variable', timeline);
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
