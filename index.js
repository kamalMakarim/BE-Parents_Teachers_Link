const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const logRoutes = require("./src/routes/log.routes");   
port = process.env.PORT || 3000;


const app = express();
require("dotenv").config();
require("./src/config/monggo.config").connectDB();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/log", logRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
