import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true},
  date: { type: Date, required: true},
  location: {type: String, required: true},
  description: { type: String},
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    }
  ],
});

const Event = mongoose.model("Event", EventSchema);
export default Event;
