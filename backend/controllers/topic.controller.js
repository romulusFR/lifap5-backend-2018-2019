const debug = require("debug")("lifap5:topic-controller");
const Topic = require("../models/topic.model");

/***************** verification middleware for topics **********************/
exports.check_topic_by_id = function(req, res, next, id, name) {
  debug(`exports.check_topic_by_id for ${name}="${id}"`);
  const query = Topic.findById(id, { _id: 1, user: 1, open: 1 });
  query
    .exec()
    .then((topic) => {
      if (!topic) {
        const err = { name: "NoSuchTopic", message: `No such topic "${id}"` };
        res.status(404).send(err);
      } else {
        req.topic_id = topic._id;
        req.topic_user = topic.user;
        req.topic_open = topic.open;
        next();
      }
      return;
    })
    .catch((err) => res.status(400).send(err));
};

exports.check_topic_ownership = function(req, res, next) {
  debug(
    `exports.check_topic_ownership for req.topic_id="${req.topic_id} by ${
      req.topic_user
    } asked by ${req.user}"`
  );
  if (req.topic_user !== req.user) {
    const err = {
      name: "NoOwnership",
      message: `Topic ${req.topic_id} is not created by ${req.user}`
    };
    res.status(403).send(err);
  } else next();
};

exports.check_topic_open = function(req, res, next) {
  debug(`exports.check_topic_open for req.topic_id="${req.topic_id}"`);
  if (!req.topic_open) {
    const err = {
      name: "ClosedTopic",
      message: `Topic ${req.topic_id} is closed by ${req.topic_user}`
    };
    res.status(403).send(err);
  } else next();
};

/***************** topics **********************/
exports.create_topic = function(req, res, next) {
  let obj = { ...req.body };
  obj.user = req.user;
  obj.posts = [];
  delete obj.date;

  let topic = new Topic(obj);
  topic
    .save()
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send(err);
      } else next(err);
    });
};

exports.find_all_ids = function(req, res, next) {
  const query = Topic.find({});
  query
    .exec()
    .then((topics) =>
      res.status(200).send(topics.map((t) => ({ _id: t._id, user: t.user })))
    )
    .catch(next);
};

exports.find_by_id = function(req, res, next) {
  const query = Topic.findById(req.topic_id, "-posts");
  query
    .exec()
    .then((topic) => res.status(200).send(topic))
    .catch(next);
};

exports.update_topic_by_id = function(req, res, next) {
  let obj = { ...req.body };
  delete obj._id;
  delete obj.user;
  delete obj.posts;
  delete obj.date;
  const query = Topic.findByIdAndUpdate(req.topic_id, obj, { new: true });
  query
    .exec()
    .then((topic) => res.status(200).send(topic))
    .catch(next);
};

exports.clopen_topic_by_id = function(req, res, next) {
  const query = Topic.findById(req.topic_id);
  query
    .exec()
    .then((topic) => {
      topic.open = !topic.open;
      return topic.save();
    })
    .then((topic) => res.status(200).send({ open: topic.open, _id: topic._id }))
    .catch(next);
};

exports.delete_topic_by_id = function(req, res, next) {
  Topic.findByIdAndDelete(req.topic_id)
    .then((data) => {
      const err = {
        name: "NoDelete",
        message: `Topic ${req.topic_id} from ${req.topic_user} NOT deleted`
      };
      if (!data) next(err);
      else res.status(200).send(data);
      return;
    })
    .catch(next);
};

exports.delele_all_topics = function(req, res, next) {
  Topic.deleteMany({ user: req.user })
    .then((data) => {
      data.message = `All topics by user "${req.user}" deleted`;
      res.send(data);
      return;
    })
    .catch(next);
};

/***************** verification middleware for posts **********************/
exports.check_post_by_id = function(req, res, next, post, name) {
  debug(`exports.check_post_by_id for ${name}="${post}"`);
  const query = Topic.findOne(
    { _id: req.topic_id, posts: { $elemMatch: { _id: post } } },
    { posts: 1 }
  );
  query
    .exec()
    .then((topic) => {
      if (!topic || !topic.posts.length) {
        const err = {
          name: "NoSuchPost",
          message: `No such post "${post}" for topic "${req.topic_id}"`
        };
        res.status(404).send(err);
      } else {
        const the_post = topic.posts.id(post);
        req.post_id = the_post._id;
        req.post_user = the_post.user;
        next();
      }
      return;
    })
    .catch((err) => res.status(400).send(err));
};

exports.check_post_ownership = function(req, res, next) {
  debug(
    `exports.check_post_ownership for post "${req.post_id}" by "${
      req.post_user
    }" of topic "${req.topic_id}" asked by "${req.user}"`
  );
  if (req.post_user !== req.user) {
    const err = {
      name: "NoOwnership",
      message: `Post "${req.post_id}" of topic "${
        req.topic_id
      }" is not created by "${req.user}"`
    };
    res.status(403).send(err);
  } else next();
};

/***************** get posts **********************/

exports.find_all_posts = function(req, res, next) {
  const query = Topic.findById(req.topic_id, "posts");
  query
    .exec()
    .then((topic) => res.status(200).send(topic.posts))
    .catch(next);
};

//db.topics.updateOne({"_id" : ObjectId("5c9ca3c633d4651059b3ccd2")}, {$push : {contributions : OID}})
exports.create_post = function(req, res, next) {
  let post = {};
  if (!req.body.content) {
    const err = {
      name: "NoContent",
      message: `New post for topic "${req.topic_id}" has empty content"`
    };
    return res.status(400).send(err);
  } else {
    post.content = req.body.content;
  }
  post.user = req.user;
  delete post.likers;
  delete post.dislikers;
  delete post.date;
  const query = Topic.findByIdAndUpdate(
    req.topic_id,
    { $push: { posts: post } },
    { new: true }
  );
  query
    .exec()
    .then((data) => res.send(data.posts[data.posts.length - 1]))
    .catch(next);
};

// db.topics.find({"_id" : ObjectId("5c9d35729ebb2b4c12ef15a0"), posts : {$elemMatch :{"_id" : ObjectId("5c9d3c508ed0e053ab93a24d")}}})
// , {$push : { list : req.user}}, {new:true}
exports.update_post_toggle_like = (like) => (req, res, next) => {
  const field = like ? "likers" : "dislikers";
  const query = Topic.findById(req.topic_id);
  query
    .exec()
    .then((topic) => {
      // magic id for subdocuments https://mongoosejs.com/docs/subdocs.html
      let post = topic.posts.id(req.post_id);
      // eslint-disable-next-line security/detect-object-injection
      if (post[field].includes(req.user))
        // eslint-disable-next-line security/detect-object-injection
        post[field] = post[field].filter((x) => x !== req.user);
      // eslint-disable-next-line security/detect-object-injection
      else post[field].push(req.user);
      return topic.save();
    })
    .then((topic) => {
      const post = topic.posts.id(req.post_id);
      res.send(post);
      return;
    })
    .catch(next);
};

// db.topics.update({"_id" : ObjectId("5c9cbf3e1cbff83153304c5c")},{$pull : {posts : {"_id" : ObjectId("5c9cd004338b8b555f4bd798"), user : "toto"}}}, {multi:true})
exports.delete_post = function(req, res, next) {
  const query = Topic.findByIdAndUpdate(
    req.topic_id,
    { $pull: { posts: { _id: req.post_id, user: req.user } } },
    { new: true }
  );
  query
    .exec()
    .then((_topic) => {
      const data = {
        deleted: `${req.post_id}`,
        message: `Post ${req.post_id} for topic ${req.topic_id} deleted`
      };
      res.send(data);
      return;
    })
    .catch(next);
};
