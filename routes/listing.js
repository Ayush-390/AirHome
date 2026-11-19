const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// Checks the form data with Joi. Used by Create and Update routes.
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};


router
.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.createListing)
);



router.get("/new", isLoggedIn, listingController.renderNewForm);


router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
  isLoggedIn,
  isOwner,
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.updateListing)
)
.delete(isLoggedIn,isOwner,
  wrapAsync(listingController.destroyListing)
)











// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);




module.exports = router;
