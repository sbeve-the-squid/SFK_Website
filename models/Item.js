import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true},
  quantity: {type: Number, required: true},
});

const Item = mongoose.model("Item", ItemSchema);
export default Item;
