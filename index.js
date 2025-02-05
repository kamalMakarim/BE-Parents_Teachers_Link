const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const logRoutes = require("./src/routes/log.routes");
const studentRoutes = require("./src/routes/student.routes");
const chatRoutes = require("./src/routes/chat.routes");
const cors = require("cors");
const sanitizer = require("perfect-express-sanitizer");
const sanitizerMiddleware = require("./src/middlewares/sanitizer.middleware");
const bodyParser = require('body-parser');
const fs = require('fs');
require("dotenv").config();
const port = process.env.PORT || 5000;


const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOptions));

require("./src/config/monggo.config").connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//sql injection prevention
app.use(
  sanitizer.clean(
    {
      xss: true,
      noSql: true,
      sql: true,
      level: 3,
    },
    (whiteList = []),
    (only = ["body", "query"])
  )
);

//logger
app.use(bodyParser.json());
app.use((req, res, next) => {
  const oldSend = res.send; // Save original res.send

  res.send = function (data) {
    try {
      // Log the response status and data.message if present
      const logData = {
        statusCode: res.statusCode,
        message: JSON.parse(data).message || 'No message',
      };
      console.log(`[${logData.statusCode}]${req.method} ${req.originalUrl} Message: ${logData.message}`);
    } catch (error) {
      console.error('Error parsing response data for logging', error);
    }
    oldSend.apply(res, arguments); // Call the original res.send
  };

  next();
});

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/log", logRoutes);
app.use("/student", studentRoutes);
app.use("/chat", chatRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
