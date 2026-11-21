const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
    .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  }


  module.exports.createListing = async (req, res) => {
      let response = await geocodingClient
      .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  

      let url = req.file.path;
      let filename = req.file.filename;
      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      newListing.image = {url, filename};

      newListing.geometry = response.body.features[0].geometry;

      let savedListing = await newListing.save();
      console.log(savedListing);

      req.flash("success", "New Listing Created!");
      res.redirect("/listings");
    }



    module.exports.renderEditForm = async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
          req.flash("error", "Listing you requested for does not exist!");
          return res.redirect("/listings");
        }

        let originalImageUrl = listing.image.url;
        originalImageUrl.replace("/upload/", "/upload/h_300,w_250")
        res.render("listings/edit.ejs", { listing, originalImageUrl});
      };

      


module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body.listing };

  // Avoid overwriting nested image object directly with raw form input
  const formImage = updates.image;
  delete updates.image;

  if (req.file) {
    // New file uploaded via Multer / Cloudinary
    updates.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  } else if (formImage && typeof formImage === "object" && "url" in formImage) {
    // Fallback if an edit form still sends listing[image][url] without a new file
    updates["image.url"] = (formImage.url || "").trim() || Listing.DEFAULT_IMAGE;
  }

  const updated = await Listing.findByIdAndUpdate(
    id,
    { $set: updates },
    { runValidators: true }
  );

  if (!updated) {
    throw new ExpressError(404, "Listing not found");
  }

  req.flash("success", "New Listing Updated!");
  res.redirect(`/listings/${id}`);
};

  



  module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "New Listing Deleted!");
    res.redirect("/listings");
  }