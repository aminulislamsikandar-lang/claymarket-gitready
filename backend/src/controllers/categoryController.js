import { Category } from '../models/Category.js';
import { ok } from '../utils/apiResponse.js';
export const listCategories = async (req, res) => ok(res, await Category.find().sort({ name: 1 }));
export const getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  return ok(res, category);
};
