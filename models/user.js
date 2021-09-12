import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required:  true },
  email: { type: [String], required: true },
  password: { type: String, required: true },
  id: { type: String },
  followers: { type: [String] },
  following: { type: [String] },
  profilePic: { type: String },
  description: { type: String , default: "Hello! Nice to have you on Memories"}
});

export default mongoose.model("User", userSchema);