// all initializations logic here

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// connection establish
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");

  await initDB();

  await mongoose.disconnect();
}

const initDB = async () => {
  await Listing.deleteMany({});

  // Mapping over initData to assign an owner ID to each listing and return new Array
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: '6af3f7996fdd63f801069b07', // Replace with an actual User ID from your DB if needed
    }));

  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

main().catch((err) => {
  console.log(err);
});