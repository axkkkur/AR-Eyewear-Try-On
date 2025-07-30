import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // image URL or local path
  modelURL: { type: String, required: true }, // PNG or GLB for try-on
});

export default mongoose.model("Product", productSchema);
