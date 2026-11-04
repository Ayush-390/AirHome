const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Checks the form data with Joi. Used by Create and Update routes.
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// New Route (must stay ABOVE the Show Route)
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/show.ejs", { listing });
  })
);

// Create Route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

// Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body.listing };
    const image = updates.image;
    delete updates.image;

    // The form sends listing[image][url]. Empty box -> default image.
    if (image) {
      updates["image.url"] = (image.url || "").trim() || Listing.DEFAULT_IMAGE;
    }

    const updated = await Listing.findByIdAndUpdate(
      id,
      { $set: updates },
      { runValidators: true }
    );
    if (!updated) {
      throw new ExpressError(404, "Listing not found");
    }
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  })
);

// Any other URL -> 404
app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handler (must be LAST)
app.use((err, req, res, next) => {
  // A bad id like /listings/123 is not a server problem, the page just doesn't exist
  if (err.name === "CastError") {
    err = new ExpressError(404, "Listing not found");
  }
  // Mongoose validation problems are bad data from the user
  if (err.name === "ValidationError") {
    err = new ExpressError(400, err.message);
  }

  const statusCode = err.statusCode || 500;
  // Show real messages for expected errors, a safe message for unknown ones
  const message = err.statusCode ? err.message : "Something went wrong!";

  if (statusCode === 500) {
    console.error(err); // so you can still see the real error in the terminal
  }
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});