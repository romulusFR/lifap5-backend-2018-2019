const express = require("express");
const router = express.Router();

const topic_controller = require("../controllers/topic.controller");
const user_controller = require("../controllers/user.controller");

/** *********  routes with authentication **********************/

// ensure that all write requests (POST, PUT, DELETE) check if user is authenticated using x-api-hey header
// sets req.user when OK
router.post("*", user_controller.validate_user);
router.put("*", user_controller.validate_user);
router.delete("*", user_controller.validate_user);

/** *********  routes with topics'id verification **********************/
// checked before more specific routes that use a topic's id
// sets req.topic_id and req.topic_user when OK
router.param("id", topic_controller.check_topic_by_id);

/** *********  routes for topics **********************/

// create a new topic
router.post("/create", [topic_controller.create_topic]);
// all ids
router.get("/", [topic_controller.find_all_ids]);
// all informations about a topic but its posts
router.get("/:id", [topic_controller.find_by_id]);
// update one topic (but not its posts) authored by the current user
router.put("/:id/update", [
  topic_controller.check_topic_ownership,
  topic_controller.update_topic_by_id
]);
// toggle state of topic
router.put("/:id/clopen", [
  topic_controller.check_topic_ownership,
  topic_controller.clopen_topic_by_id
]);
// delete one topic  authored by the current user
router.delete("/:id/delete", [
  topic_controller.check_topic_ownership,
  topic_controller.delete_topic_by_id
]);
// delete all topics authored by the current user
router.delete("/delete-all", [topic_controller.delele_all_topics]);

/***********  routes with topics'id verification **********************/
// checked before more specific routes that use a post's id
// sets req.post_id and req.post_user when OK
router.param("post", topic_controller.check_post_by_id);

/***********  routes for posts **********************/
// add a new post to a topic, current user is its author
router.post("/:id/post(s?)/create", [
  topic_controller.check_topic_open,
  topic_controller.create_post
]);
// get all posts of a topic
router.get("/:id/post(s?)/", [topic_controller.find_all_posts]);
// like and dislike a post: add current user to its (dis)liker list
router.put("/:id/post(s?)/:post/like", [
  topic_controller.check_topic_open,
  topic_controller.update_post_toggle_like(true)
]);
router.put("/:id/post(s?)/:post/dislike", [
  topic_controller.check_topic_open,
  topic_controller.update_post_toggle_like(false)
]);
// delete one post authored by the current user
router.delete("/:id/post(s?)/:post/delete", [
  topic_controller.check_topic_open,
  topic_controller.check_post_ownership,
  topic_controller.delete_post
]);

module.exports = router;
