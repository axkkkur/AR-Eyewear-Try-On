import express from "express";
import { getProducts, seedProducts } from "../controllers/productController.js";
const router = express.Router();
router.get("/", getProducts);
router.get("/seed", seedProducts);
export default router;
