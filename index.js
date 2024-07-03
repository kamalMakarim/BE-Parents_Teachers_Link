const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const logRoutes = require("./src/routes/log.routes");   
const studentRoutes = require("./src/routes/student.routes");
const chatRoutes = require("./src/routes/chat.routes");
const cors = require("cors");

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow any localhost origin
    if (/^http:\/\/localhost(:[0-9]+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Disallow all other origins
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // allow credentials
  methods: ['GET', 'POST', 'DELETE', 'PUT'] // allow GET and POST requests
};
port = process.env.PORT || 3000;


const app = express();
require("dotenv").config();
require("./src/config/monggo.config").connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/log", logRoutes);
app.use("/student", studentRoutes);
app.use("/chat", chatRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
