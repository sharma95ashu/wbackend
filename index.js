const dotenv = require("dotenv");
const { app } = require("./app");
dotenv.config();

// port
const port = process.env.PORT || 7001; // Default to port 7001 if not specified

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
