'use strict';

const compiler = require('./compiler.js');
const util = require('util');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');

const COLLECTION = 'metrics_requests';
const DELAY_MS = 1000 * 10;

var database = null;
var collection = null;
var buffer = [];

const flush = _.throttle(() => {
  collection.insertMany(buffer, (error) => {
    if (error) throw error;
    buffer = [];
  });
}, DELAY_MS);

exports.init = (options) => {
  let url = `mongodb://${options.user}:${options.password}@${options.host}:${options.port}/${options.database}`;
  MongoClient.connect(url, (error, db) => {
    if (error) throw error;
    database = db;
    collection = db.collection(COLLECTION);
  });
};

exports.add = (item) => {
  if (!collection) throw new Error('No connected to MongoDB');
  buffer.push(item);
  flush();
};

exports.timeline = (from, to, resolution, variable, callback) => {
  if (!collection) throw new Error('No connected to MongoDB');
  let $project = time(resolution);
  $project[variable] = '$' + variable;
  let query = [{
    $match: {date: {$gte: moment(from).utc().toDate(), $lte: moment(to).utc().toDate()}},
  }, {
    $project,
  }, {
    $group: {
      _id: {value: '$' + variable, year: '$year', month: '$month', day: '$day', hour: '$hour', minute: '$minute'},
      count: {$sum: 1},
    }
  }];
  collection.aggregate(query).toArray((error, data) => {
    if (error) throw error;
    callback(null, compiler.timeline(data));
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
