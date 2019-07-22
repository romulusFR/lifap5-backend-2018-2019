const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  login: { type: String, required: true, max: 64, index: true },
  avatar: { type: String, required: false, max: 512 },
  joined_on: { type: Date, required: false },
  apikey: { type: String, required: true, max: 64, index: true }
});

UserSchema.statics.find_by_key = function(key) {
  const query = this.findOne({ apikey: key });
  //returns a promise
  return query.exec();
};

// Export the model
module.exports = mongoose.model("User", UserSchema);
