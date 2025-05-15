import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
  amount: { type: Number, required: true, default: 0 },
  history: [
    {
      date: { type: Date, default: Date.now },
      difference: Number,
      note: String
    }
  ]
});

const Budget = mongoose.model("Budget", BudgetSchema);
export default Budget;
