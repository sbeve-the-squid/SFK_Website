import mongoose from "mongoose";

const AttendanceLogSchema = new mongoose.Schema({
  date: { type: String, required: true },
  absentees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, { timestamps: true });

const AttendanceLog = mongoose.model("AttendanceLog", AttendanceLogSchema);
export default AttendanceLog;
