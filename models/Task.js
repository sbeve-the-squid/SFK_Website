import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true},
  deadline: { type: Date, required: true},
  description: { type: String},
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    }
  ],
  status: {
    type: String,
    enum: ["complete", "incomplete"],
    default: "incomplete"
  },
});

const Task = mongoose.model("Task", TaskSchema);
export default Task;
