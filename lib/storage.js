'use strict';

const util = require('util');
const sqlite = require('sqlite3').verbose();
const moment = require('moment');

const db = new sqlite.Database('database');
const REQUESTS_TABLE = 'requests';

db.run(`
  CREATE TABLE IF NOT EXISTS ${REQUESTS_TABLE} (
    method TEXT,
    route TEXT,
    request_length INTEGER,
    os TEXT,
    date TEXT,
    response_code INTEGER,
    response_length INTEGER,
    response_type TEXT,
    duration INTEGER
  );
`);

var data = [];

exports.add = (metadata) => {
  data.push(metadata);
  let cmd = `
    INSERT INTO ${REQUESTS_TABLE} VALUES (
      '${metadata.method}',
      '${metadata.route}',
      ${metadata.request_length || 0},
      '${metadata.os}',
      '${metadata.date}',
      ${metadata.response_code || 0},
      ${metadata.response_length || 0},
      '${metadata.response_type || 'none'}',
      ${metadata.duration}
    )
  `;
  db.run(cmd);
};

exports.timeline = (from, to, variable, callback) => {
  from = moment(from).format('YYYY-MM-DD');
  to = moment(to).format('YYYY-MM-DD');
  let cmd = `
    SELECT date, ${variable}, count(*) as count from ${REQUESTS_TABLE}
    WHERE date >= '${from}' AND date <= '${to}'
    GROUP BY date, ${variable}
  `;
  db.all(cmd, (error, data) => {
    if (error) return callback(error);
    var timeline = {};
    for (let item of data) {
      timeline[item.date] = timeline[item.date] || {};
      timeline[item.date][item[variable]] = item.count;
    }
    return callback(null, timeline);
  });
};



exports.print = () => {
  console.log('\nMETRICS\n==================================');
  console.log(util.inspect(data, {depth: null, colors: true}));
  db.all(`SELECT * FROM ${REQUESTS_TABLE}`, (error, data) => {
    //console.log('QUERY FINISHED', error, util.inspect(data, {depth: null, colors: true}));
    console.log('QUERY RESULT', error, data.length, 'items');
  });
};
