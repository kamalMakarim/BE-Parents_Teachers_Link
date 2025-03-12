const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

exports.connectDB = async function () {
  const URI = process.env.MONGODB_URI;
  const connectionParams = {};

  mongoose.set("strictQuery", false);

  mongoose
    .connect(URI, connectionParams)
    .then(() => console.info("Connected to monggodb"))
    .catch((err) => {
      console.error("Error" + err.message);
      fs.appendFileSync(path.join(__dirname, 'error.log'), `${new Date().toISOString()} - ${err.message}\n`);
    });
};

// Wrap mongoose queries to catch errors and log them
const originalExec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
  try {
    return await originalExec.apply(this, arguments);
  } catch (err) {
    // Log the error to a file
    fs.appendFileSync(path.join(__dirname, 'error.log'), `${new Date().toISOString()} - ${err.message}\n`);
    // Re-throw the error to be handled by the calling function
    throw err;
  }
};