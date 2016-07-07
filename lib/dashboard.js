import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import Dashboard from '../client/components/Dashboard';

exports.init = (server, options) => {
  let markup = ReactDOMServer.renderToString(<Dashboard/>);
  server.get(`/${options.endpoint}/`, file('./client/index.html', options, {markup}));
  server.get(`/${options.endpoint}/main.js`, file('./client/main.js', options));
  server.get(`/${options.endpoint}/style.css`, file('./client/style.css', options));
};

function file (path, options, replacements) {
  replacements = replacements || {};
  replacements.endpoint = options.endpoint;
  return (request, response) => {
    fs.readFile(path, 'utf8', (error, value) => {
      if (error) return response.send(500);
      value = replaceMacros(value, replacements);
      response.setHeader('Content-Type', type(path));
      response.end(value);
    });
  };
}

function replaceMacros (text, replacements) {
  let value = text;
  for (let key in replacements) {
    value = value.replace(new RegExp(`{{ ${key} }}`, 'g'), replacements[key]);
  }
  return value;
}

function type (path) {
  if (/.js$/.test(path)) return 'text/javascript';
  if (/.css$/.test(path)) return 'text/css';
  if (/.html$/.test(path)) return 'text/html';
}
