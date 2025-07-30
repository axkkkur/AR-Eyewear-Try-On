import products from "../data/product.js";
import Product from "../model/Product.js";
export const getProducts = async (req, res) => {
  const items = await Product.find();
  res.json(items);
};
export const seedProducts = async (req, res) => {
  await Product.deleteMany();
  const inserted = await Product.insertMany(products);
  res.json(inserted);
};
