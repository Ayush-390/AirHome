const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

const listingController = require("../controllers/listings.js");


// Checks the form data with Joi. Used by Create and Update routes.
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};


// Index Route
router.get("/",wrapAsync(listingController.index));

// New Route (must stay ABOVE the Show Route)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show Route
router.get(
  "/:id",
  wrapAsync(listingController.showListing)
);

// Create Route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.createListing)
);

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);



// Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.updateListing)
);

// Delete Route
router.delete("/:id",isLoggedIn,isOwner,
  wrapAsync(listingController.destroyListing)
);

module.exports = router;