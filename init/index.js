// const mongoose = require('mongoose');
// const initData = require('./data.js');
// const Listing = require('../models/listing.js');


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// async function main() {
//   await mongoose.connect(MONGO_URL)
//   .then(() => console.log("DB Connected!"))
//   .catch((err) => console.log(err));
// }




// main()
//   .then(() => {
//     console.log('Connected to MongoDB');
//   }).catch(err => {
//     console.error('Error connecting to MongoDB:', err);
//   });

// const initDB = async () => {
//   await Listing.deleteMany({});
//   await Listing.insertMany(initData.data);
//   console.log("Database initialized with sample data");
//   // mongoose.connection.close();
// }

// initDB();


const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({ ...obj, owner: "6a59638b81fc79ed13881c1b" }));

  await Listing.insertMany(initData.data);
  console.log("Database initialized with sample data");
};

main()
  .then(() => {
    console.log("DB Connected!");
    return initDB();  // ✅ pehle connect, phir initDB
  })
  .catch((err) => {
    console.error("Error:", err);
  });