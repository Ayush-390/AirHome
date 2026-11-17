const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

const userController = require("../controllers/user.js");
const { renderFile } = require("ejs");

router.get("/signup", userController.renderSignupForm);

router.post(
  "/signup",
  wrapAsync(userController.signup)
);


router.get("/login", userController.renderLoginForm);


// Handle Login POST request using Passport middleware
router.post("/login", 
  saveRedirectUrl,
    passport.authenticate("local", { 
        failureRedirect: "/login", 
        failureFlash: true 
    }), 
    userController.login
);



router.get("/logout", userController.logout);




module.exports = router;