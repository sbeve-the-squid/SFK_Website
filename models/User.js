import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String, 
    enum: ["user", "admin"],
    default: "user"
  },
  status: {
    type: String,
    enum: ["confirmed", "unconfirmed"],
    default: "unconfirmed"
  },
  hours: {type: Number, default: 0},
  lessonsTaught: {type: Number, default: 0},
  lessonsPlanned: {type: Number, default: 0},
  formSubmitted: {type: Boolean, default: false},

  upcomingEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    }
  ],
  toDo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }
  ],
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
