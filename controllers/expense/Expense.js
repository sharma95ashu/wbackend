const Expense = require("../../models/expense");

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const {
      date,
      customer,
      product,
      packagingType,
      packagingQty,
      itemsPerPack,
      fare,
      driver,
      vehicle,
      from,
      to,
      deliveryType,
      notes,
    } = req.body;

    const totalUnits = packagingQty * itemsPerPack;
    const costPerPack = fare / packagingQty;
    const costPerUnit = fare / totalUnits;

    const expense = await Expense.create({
      date,
      customer,
      product,
      packagingType,
      packagingQty,
      itemsPerPack,
      totalUnits,
      fare,
      costPerPack,
      costPerUnit,
      driver,
      vehicle,
      from,
      to,
      deliveryType,
      notes,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Expenses (with search + pagination)
exports.getAllExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, searchTerm = "" } = req.query;
    const query = searchTerm
      ? { customer: { $regex: searchTerm, $options: "i" } }
      : {};

    const expenses = await Expense.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Expense.countDocuments(query);

    res.json({
      data: expenses,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const { packagingQty, itemsPerPack, fare, ...rest } = req.body;

    let updateData = { ...rest };

    if (packagingQty && itemsPerPack && fare) {
      const totalUnits = packagingQty * itemsPerPack;
      updateData = {
        ...updateData,
        packagingQty,
        itemsPerPack,
        totalUnits,
        fare,
        costPerPack: fare / packagingQty,
        costPerUnit: fare / totalUnits,
      };
    }

    const expense = await Expense.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
