const mongoose = require("mongoose");
const ChatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  writter: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", ChatSchema);
