const Role = require("../../models/role");

// Create Role
exports.createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    const existing = await Role.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = await Role.create({ name, description, permissions });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
};

// Get All Roles (with search + pagination)
exports.getAllRoles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, searchTerm = "" } = req.query;
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};

    const roles = await Role.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Role.countDocuments(query);

    res.json({
      data: roles,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
};

// Get Role by ID
exports.getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
};

// Update Role
exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
};

// Delete Role
exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
};
