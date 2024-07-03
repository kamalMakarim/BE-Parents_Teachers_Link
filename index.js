const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const logRoutes = require("./src/routes/log.routes");   
const studentRoutes = require("./src/routes/student.routes");
const chatRoutes = require("./src/routes/chat.routes");
const cors = require("cors");

const corsOptions = {
  origin: true, // allow to server to accept request from different origin
  credentials: true, // allow credentials
  methods: ['GET', 'POST', 'DELETE', 'PUT'] // allow GET and POST requests
};
port = process.env.PORT || 5000;


const app = express();

app.use(cors({
  origin: 'https://bukom.vercel.app',
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://bukom.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  next();
});
require("dotenv").config();
require("./src/config/monggo.config").connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/log", logRoutes);
app.use("/student", studentRoutes);
app.use("/chat", chatRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
