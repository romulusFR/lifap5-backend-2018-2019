/* eslint-disable no-console */
const debug = require("debug")("lifap5:server");
// https://www.npmjs.com/package/ws
const websocket = require("ws");
const mongoose = require("mongoose");
const app = require("./app.js");

// read package.json
const { version } = require("./package");

// capture environnement variables
const db_env = process.env.DB_ENV;
const node_env = process.env.NODE_ENV;
const node_debug = process.env.DEBUG;

console.log(`process.env.DB_ENV="${db_env}"`);
console.log(`process.env.NODE_ENV="${node_env}"`);
console.log(`process.env.DEBUG="${node_debug}"`);
console.log(`config.version="${version}"`);

// mongod server connection string => replicaSet MUST be given to have the change stream
// eslint-disable-next-line prettier/prettier
const local_mongo_db_url = "mongodb://localhost:27017/lifap5-backend?replicaSet=replica-local";
const docker_mongo_db_url = "mongodb://mongo:27017/lifap5-backend";

// chose server according to db_env
const mongo_db_url =
  db_env === "docker" ? docker_mongo_db_url : local_mongo_db_url;

// Set up mongoose connection
// Mongo do no use the debug module, so its activated manually
if (debug.enabled) {
  mongoose.set("debug", true);
}
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

// http(s) server ports
const http_port = 3000;

const server = app.listen(http_port, () => {
  console.log(`lifap5-backend server is up and running on port ${http_port}`);
});

const wserver_config = { server, path: "/stream/", clientTracking: true };
const wsserver = new websocket.Server(wserver_config); //

// A broadcast method to all clients connected
// https://github.com/websockets/ws#server-broadcast
wsserver.broadcast = (data) => {
  debug(`ws: broadcasting "${data}"`);
  wsserver.clients.forEach((client) => {
    if (client.readyState === websocket.OPEN) {
      client.send(data);
    }
  });
};

wsserver.on("connection", (socket, req) => {
  const ip = req.headers["x-forwarded-for"] || req.host;
  const msg = {
    type: "info",
    msg: `lifap5-backend ${version} is running WebSocket`,
    client_ip: ip,
    time: Date.now()
  };

  // Once connected, send a hello message
  debug(`ws: send "${JSON.stringify(msg)}"`);
  socket.send(JSON.stringify(msg));

  // nothing but debug on message
  socket.on("message", (message) => {
    debug(`ws: received "${message}" @${Date.now()}`);
  });

  // see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
  // Nginx will timeout proxy connections after 60s with code 1006
  // http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_connect_timeout
  socket.on("close", (code) => {
    debug(`ws: closing with code ${code} @${Date.now()}`);
  });
});

mongoose
  .connect(mongo_db_url, { useNewUrlParser: true })
  // https://mongoosejs.com/docs/api.html#mongoose_Mongoose-connect
  .then((m) => {
    // When connected to the DB, pipe mongo's change stream to the websocket

    const mongo_conn = m.connection;
    debug(`Mongo ${mongo_db_url} connected`);

    // https://mongoosejs.com/docs/api.html#model_Model.watch
    const change_stream = mongo_conn.collection("topics").watch();

    change_stream.on("change", (change) => {
      const msg = {
        type: change.operationType,
        _id: change.documentKey._id,
        time: change.clusterTime.high_
      };
      //debug(`Mongo.watch(): ${JSON.stringify(msg)}`);
      wsserver.broadcast(JSON.stringify(msg));
    });

    return mongo_conn;
  })
  .catch(console.error);
