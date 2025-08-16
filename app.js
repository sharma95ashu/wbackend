const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
const { connectToMongo } = require("./db");
const {
  globalErrorHandler,
  notFoundHandler,
} = require("./middleware/errorHandler");

dotenv.config();

// Importing all the Routes
const indexRoutes = require("./routes/indexRoutes");
// app
const app = express();

// Connect to DB
connectToMongo();

// middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());

app.use("/api", indexRoutes);

// health check route
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "UP", message: "Server is running smoothly!" });
});

// Handle 404 errors
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

module.exports = { app };
