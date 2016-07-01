'use strict';

const fs = require('fs');
const ejs = require('ejs');

const markup = fs.readFileSync('./ejs/index.ejs', 'utf8');

exports.init = (server) => {
  server.get('/perboard/', dashboard);
};

function dashboard (request, response) {

  let data = {};
  // TODO Draw real data

  let html = ejs.render(markup, data);
  response.setHeader('Content-Type', 'text/html');
  response.end(html);
}
