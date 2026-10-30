const mongoose = require("mongoose");
const Schema = mongoose.Schema;           //acquiring schema

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
  filename: String,
  url: String,
},
    
  // image: {
  //   type: String,
  //   default:"https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&",
  
  //   set: (v) =>
  //     v === ""
  //       ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&"
  //       : v,
  // },
  price: {
    type: Number,
    required: true,
  },
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;