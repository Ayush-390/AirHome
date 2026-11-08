const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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



// Validation middleware for reviews (lines 48-56)
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});



app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);









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