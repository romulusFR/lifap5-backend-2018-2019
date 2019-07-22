const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/user.controller");

// a simple test url to check that all of our files are communicating correctly.
router.get("/", [user_controller.find_all_logins]);
router.get("/whoami", [user_controller.validate_user, user_controller.whoami]);
router.get("/:login", [user_controller.find_by_login]);
module.exports = router;
