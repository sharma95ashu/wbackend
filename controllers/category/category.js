const Category = require("../../models/category");
const Product = require("../../models/product");
const Sub = require("../../models/sub");
const slugify = require("slugify");

// Create a new category
const create = async (req, res) => {
  try {
    const { name } = req.body; // Get the category name from the request body
    // Create and save a new category with a slug
    res.json(await new Category({ name, slug: slugify(name) }).save());
  } catch (err) {
    res.status(400).send("Create category failed");
  }
};

// List all categories
const list = async (req, res) => {
  // Find all categories, sort by creation date in descending order, and send them in the response
  res.json(await Category.find({}).sort({ createdAt: -1 }).exec());
};

// Get a specific category and its products
const read = async (req, res) => {
  // Find the category by its slug
  let category = await Category.findOne({ slug: req.params.slug }).exec();

  // Find all products associated with the found category
  const products = await Product.find({ category }).populate("category").exec();

  res.json({
    category,
    products,
  });
};

// Update an existing category
const update = async (req, res) => {
  const { name } = req.body;
  try {
    // Find and update the category by its slug, and return the updated category
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).send("Category update failed");
  }
};

// Delete a category
const remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    res.status(400).send("Category delete failed");
  }
};

// Get all subcategories for a given category
const getSubs = async (req, res) => {
  try {
    // Find subcategories based on the parent ID
    res.json(await Sub.find({ parent: req.params._id })); // Send the subcategories in the response
  } catch (err) {
    console.error(err); // Log any errors
    res.status(400).send("Unable to get sub-categories"); // Send error response
  }
};

module.exports = { create, list, read, update, remove, getSubs };
