const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const ejs = require('ejs');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema} =require("./schema.js")
const Review = require('./models/review.js');

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// const MONGO_URI = "mongodb://127.0.0.1:27017/wanderlust";
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });



app.get("/", (req, res) => {
    res.send("Hello World");
});      

const validateListing = (req, res,next)=>{
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
}

//index route, home page                                      
app.get("/listings", wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
}));


//new route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});


//show route
app.get("/listings/:id", wrapAsync(
  async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

//create route
app.post("/listings",validateListing, wrapAsync(async (req, res,next) => {
  const newListing = new Listing(req.body.listing);
  
  await newListing.save();
  res.redirect("/listings");

}));

//edit route
app.get("/listings/:id/edit", wrapAsync( async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//update route
app.put("/listings/:id",validateListing , wrapAsync(async (req, res) => {

  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body.listing);
  res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", wrapAsync( async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

//reviews
 //post route

app.post("listing/:id/reviews", async(req,res)=>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.review.push(newReview);

  await newReview.save();
  await listing.save();



})

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "Cozy Cabin in the Woods",
//         description: "A charming cabin surrounded by nature, perfect for a weekend getaway.",
//         price: 150,
//         location: "Aspen, Colorado",
//         Country: "USA"
//     });
//     await sampleListing.save();
//     console.log("Sample listing saved to database");
//     res.send("Sample listing saved!");
// });

app.all("*splat", (req,res,next)=>{
  next(new ExpressError(404,"page not found!"));
});

app.use((err, req, res, next) => {
  let{statusCode=500, message = "Something went wrong~!"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message});
});

app.listen(8080, () => {
    console.log('Server is listening to port 8080');
});