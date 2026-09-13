const Category = require('../models/categoryModel');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.getAll(req.query.active === 'true');
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findBySlug(req.params.slug);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const image = req.file ? req.file.filename : null;
    const id = await Category.create({ ...req.body, image });
    const category = await Category.findById(id);
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const image = req.file ? req.file.filename : undefined;
    await Category.update(req.params.id, { ...req.body, ...(image && { image }) });
    const updated = await Category.findById(req.params.id);
    res.json({ success: true, message: 'Category updated', category: updated });
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    await Category.delete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

module.exports = { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };
