const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { data } = require("./data.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
require('dotenv').config();

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

// 👇 apna user _id yahan paste karo (mongosh se copy kiya hua)
const OWNER_ID = "6a59638b81fc79ed13881c1b";

main()
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
  await initDB();
  mongoose.connection.close();
}

async function initDB() {
  await Listing.deleteMany({});
  console.log("Old listings cleared. Seeding new ones...");

  for (let listingData of data) {
    try {
      let response = await geocodingClient.forwardGeocode({
        query: listingData.location,
        limit: 1,
      }).send();

      if (!response.body.features.length) {
        console.log(`⚠️  No geocode result for: ${listingData.title} (${listingData.location})`);
        continue;
      }

      let newListing = new Listing({
        ...listingData,
        owner: OWNER_ID,
        geometry: response.body.features[0].geometry,
      });

      await newListing.save();
      console.log(`✅ Added: ${listingData.title}`);
    } catch (err) {
      console.log(`❌ Failed for ${listingData.title}:`, err.message);
    }
  }
  console.log("🎉 All listings seeded!");
}