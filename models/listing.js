const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default: DEFAULT_IMAGE,
      set: (v) =>
        typeof v !== "string" || v.trim() === "" ? DEFAULT_IMAGE : v.trim(),
    },
  },

  price: {
    type: Number,
    required: true,
  },
  location: String,
  country: String,
  reviews: [
    {
        type: Schema.Types.ObjectId,
        ref: "Review", //uses this model
    },
],
owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
},
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
Listing.DEFAULT_IMAGE = DEFAULT_IMAGE;
module.exports = Listing;