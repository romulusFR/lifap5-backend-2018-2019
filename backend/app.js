/* eslint-disable no-console */

// librairies
require("make-promises-safe");
const debug = require("debug")("lifap5:main");
const express = require("express");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const helmet = require("helmet");
const cors = require("cors");

// Set up express app
const app = express();

// Poor man's logging
if (debug.enabled) {
  app.all("*", function(req, res, next) {
    const msg = `${new Date()}\n${req.method} ${req.url}`;

    debug(msg);
    next();
  });
}

// Serve static favicon
app.use(favicon("./static/favicon.ico"));

// Set up helmet without
// https://github.com/helmetjs/helmet
// https://helmetjs.github.io/
app.use(
  helmet({
    hsts: false
  })
);

// user cors middleware
// https://www.npmjs.com/package/cors
const cors_options = {
  origin: "*"

  // to serve everyone, including local files
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
  // https://w3c.github.io/webappsec-cors-for-developers/#avoid-returning-access-control-allow-origin-null
};

app.use(cors(cors_options));

// use bodyparser middleware
// "Parse incoming request bodies in a middleware before your handlers, available under the req.body property."
// https://www.npmjs.com/package/body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// basic echo service for test and example purposes
app.post("/echo", function(req, res) {
  res.status(200).send(req.body);
});

// main routes User and Topic router-level middleware
const user = require("./routes/user.route");
const topic = require("./routes/topic.route");

app.use("/user(s?)", user);
app.use("/topic(s?)", topic);

// custom 404
app.use(function(req, res, _next) {
  const err = {
    name: "ContentNotFound",
    message: `${req.method} ${req.url} not found.`
  };

  res.status(404).send(err);
});

// final error handler (non default)
// always use FOUR ARGUMENTS https://expressjs.com/en/guide/error-handling.html
app.use(function(err, req, res, _next) {
  debug(
    `${new Date()}\n${req.method} ${req.url} (x-api-key="${
      req.headers["x-api-key"]
    }") caught by default error handler\n${err}`
  );
  res.status(500).send(err);
});

module.exports = app;
