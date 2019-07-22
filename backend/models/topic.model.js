const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  content: { type: String, required: true, default: "" },
  user: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  likers: { type: [String], default: [] },
  dislikers: { type: [String], default: [] }
});

PostSchema.virtual("likers-count").get(function() {
  return this.likers.length;
});
PostSchema.virtual("dislikers-count").get(function() {
  return this.dislikers.length;
});

const TopicSchema = new Schema({
  topic: { type: String, required: true },
  open: { type: Boolean, required: true, default: true },
  desc: { type: String, required: true },
  user: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  posts: { type: [PostSchema], default: [] }
});

// Export the model
module.exports = mongoose.model("Topic", TopicSchema);
