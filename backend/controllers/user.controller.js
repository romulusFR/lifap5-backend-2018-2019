const debug = require("debug")("lifap5:user-controller");
const User = require("../models/user.model");

exports.find_all_logins = function(req, res, next) {
  const query = User.find({}, "login");
  query
    .exec()
    .then((users) => res.status(200).send(users.map((u) => u.login)))
    .catch(next);
};

// finds the user using its login
exports.find_by_login = function(req, res, next) {
  //https://mongoosejs.com/docs/api.html#model_Model.findOne
  //hides the 'apikey' field
  const query = User.findOne({ login: req.params.login }, "-apikey");
  query
    .exec()
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        const err = {
          name: "NoSuchUser",
          message: `User non-existent "${req.params.login}"`
        };
        res.status(404).send(err);
      }
      return;
    })
    .catch(next);
};

// returns the user with current 'x-api-key'
exports.whoami = function(req, res, next) {
  const query = User.findOne({ login: req.user });
  query
    .exec()
    .then((user) => res.status(200).send(user))
    .catch(next);
};

/***************** middleware: access control **********************/
//checks if "x-api-key" pertains to a registered user and set req.user to it
exports.validate_user = function(req, res, next) {
  const token = req.headers["x-api-key"];
  debug(`exports.validate_user ${token}`);
  if (!token) {
    res
      .status(401)
      .send({ name: "NoX-Api-KeyProvided", message: "No x-api-key provided." });
  } else {
    User.find_by_key(token)
      .then((user) => {
        const err = {
          name: "NoSuchX-Api-Key",
          message: `x-api-key "${token}" does not exist.`
        };
        if (user === null) {
          res.status(403).send(err);
        } else {
          req.user = user.login;
          next();
        }
        return;
      })
      .catch(next);
  }
};
