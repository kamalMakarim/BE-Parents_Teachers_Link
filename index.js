const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const logRoutes = require("./src/routes/log.routes");
const studentRoutes = require("./src/routes/student.routes");
const chatRoutes = require("./src/routes/chat.routes");
const cors = require("cors");
const sanitizer = require('perfect-express-sanitizer');
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // enable if you need cookies or authorization headers
};
app.use(cors(corsOptions));

require("./src/config/monggo.config").connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//sql injection prevention
app.use(
  sanitizer.clean({
      xss: true,
      noSql: true,
      sql: true,
  },
      only = ["body", "query"],
      whiteList = ['/auth/offline-login']
  )
);
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/log", logRoutes);
app.use("/student", studentRoutes);
app.use("/chat", chatRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
