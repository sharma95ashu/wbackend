const express = require("express");
const { loginCreateUser } = require("../../controllers/user/userController");
const loginLimiter = require("../../middlewares/loginLimiter");
const router = express.Router();

//Route to login a User
router.post("/login-create-user", loginCreateUser);

router.post("/", loginLimiter, loginCreateUser);
router.get("/refresh", loginCreateUser);
router.post("/logout", loginCreateUser);

module.exports = router;
