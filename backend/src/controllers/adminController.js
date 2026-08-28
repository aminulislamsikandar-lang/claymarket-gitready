import { Market } from '../models/Market.js';
import { Category } from '../models/Category.js';
import { ok, fail } from '../utils/apiResponse.js';

export const createMarket = async (req,res) => ok(res, await Market.create(req.body), 201);
export const updateMarket = async (req,res) => {
  const doc = await Market.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
  return doc ? ok(res, doc) : fail(res,'Market not found.',404);
};
export const deleteMarket = async (req,res) => {
  const doc = await Market.findByIdAndDelete(req.params.id);
  return doc ? ok(res,{deleted:true}) : fail(res,'Market not found.',404);
};
export const createCategory = async (req,res) => ok(res, await Category.create(req.body), 201);
export const updateCategory = async (req,res) => {
  const doc = await Category.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
  return doc ? ok(res, doc) : fail(res,'Category not found.',404);
};
export const deleteCategory = async (req,res) => {
  const doc = await Category.findByIdAndDelete(req.params.id);
  return doc ? ok(res,{deleted:true}) : fail(res,'Category not found.',404);
};
