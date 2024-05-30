const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdOn: { type: Date, default: new Date().getTime() },
  shared: { type: Boolean, default: false }, // New field for shared status
  sharedWith: { type: [String], default: [] }, // New field for user IDs or emails with whom the note is shared
});

module.exports = mongoose.model("Note", noteSchema);
