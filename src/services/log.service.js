const ClassLogSchema = require("../models/classLog.model");
const PersonalLogSchema = require("../models/personalLog.model");
const ChatSchema = require("../models/chat.model");
const neonPool = require("../config/neon.config");
const { log } = require("winston");
const { lt } = require("lodash");

exports.createLog = async function (req, res) {
  const { message, type } = req.body;
  if (!message || !type) {
    return {
      message: "All fields are required",
    };
  }
  const writter = req.user.username;
  try {
    if (req.body.studentId) {
      const { studentId } = req.body;
      const log = new PersonalLogSchema({
        message,
        type,
        writter,
        studentId,
        image: req.body.image || null,
      });
      await log.save();
    } else {
      const { rows: class_name } = await neonPool.query(
        `SELECT class_name FROM teachers WHERE username = $1 LIMIT 1`,
        [writter]
      );
      const { rows: students } = await neonPool.query(
        `SELECT id FROM students WHERE class_name = $1 LIMIT 1`,
        [class_name[0].class_name]
      );
      const studentIds = students.map((student) => student.id);
      await neonPool.query(
        `UPDATE notifications SET for_parent = for_parent + 1 WHERE student_id IN (${studentIds
          .map((_, i) => `$${i + 1}`)
          .join(", ")})`,
        studentIds
      );
      const log = new ClassLogSchema({
        message,
        type,
        writter,
        class_name: class_name[0].class_name,
        image: req.body.image || null,
      });
      await log.save();
    }
    return {
      message: "Log created",
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.createLogBidangStudy = async function (req, res) {
  const { message, type, studentId, class_name } = req.body;
  if (!message || !type) {
    return {
      message: "All fields are required",
    };
  }
  const writter = req.user.username;
  try {
    if (studentId) {
      const log = new PersonalLogSchema({
        message,
        type,
        writter,
        studentId,
        image: req.body.image || null,
      });
      await log.save();
    } else {
      let class_notifcation_update = [];
      if (class_name === "Bidang Study TK") {
        class_notifcation_update = [
          "Blue Pinter Morning",
          "Blue Pinter Afternoon",
          "Green Motekar",
          "Green Wanter",
          "Green Maher",
          "Yellow Maher",
          "Yellow Motekar",
          "Yellow Wanter",
        ];
      } else if (class_name === "Bidang Study SD") {
        class_notifcation_update = [
          "Gumujeng",
          "Someah",
          "Rancage",
          "Gentur",
          "Daria",
          "Calakan",
          "Singer",
          "Rancingeus",
          "Jatmika",
          "Gumanti",
          "Marahmay",
          "Rucita",
          "Binangkit",
          "Gumilang",
          "Sonagar",
        ];
      } else {
        class_notifcation_update = [class_name];
      }
      const { rows: students } = await neonPool.query(
        `SELECT id FROM students WHERE ${class_notifcation_update
          .map((_, i) => `class_name = $${i + 1}`)
          .join(" OR ")}`,
        class_notifcation_update
      );
      const studentIds = students.map((student) => student.id);
      await neonPool.query(
        `UPDATE notifications SET for_parent = for_parent + 1 WHERE student_id IN (${studentIds
          .map((_, i) => `$${i + 1}`)
          .join(", ")})`,
        studentIds
      );
      const log = new ClassLogSchema({
        message,
        type,
        writter,
        class_name: class_name,
        image: req.body.image || null,
      });
      await log.save();
    }
    return {
      message: "Log created",
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteLog = async function (req, res) {
  const { logId, personal } = req.query;
  try {
    if (personal === "false") {
      await ClassLogSchema.findByIdAndDelete(logId);
    } else {
      await PersonalLogSchema.findByIdAndDelete(logId);
    }
    return {
      message: "Log deleted",
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateLog = async function (req, res) {
  const { logId, personal } = req.query;
  const { message, type } = req.body;
  if (!message || !type) {
    return {
      message: "All fields are required",
    };
  }
  try {
    if (personal === "false") {
      await ClassLogSchema.findByIdAndUpdate(logId, { message, type });
    } else {
      await PersonalLogSchema.findByIdAndUpdate(logId, { message, type });
    }
    return {
      message: "Log updated",
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.getLogOfStudent = async function (req) {
  if (!req.query.timestamp) {
    return {
      message: "Timestamp is required",
    };
  }
  try {
    // Parse and validate timestamp
    const timestamp = parseInt(req.query.timestamp);
    if (isNaN(timestamp)) {
      return {
        message: "Invalid timestamp format",
      };
    }

    // Calculate the time limit (1 day before the given timestamp)
    const timeLimit = new Date(timestamp);
    timeLimit.setDate(timeLimit.getDate() - 10);

    const bidangStudi = [
      "Blue Pinter Morning",
      "Blue Pinter Afternoon",
      "Green Motekar",
      "Green Wanter",
      "Green Maher",
      "Yellow Maher",
      "Yellow Motekar",
      "Yellow Wanter",
    ].includes(req.body.class_name)
      ? "Bidang Study TK"
      : "Bidang Study SD";

    // Fetch the data sequentially
    let classLogs = await ClassLogSchema.find({
      class_name: { $in: [req.body.class_name, bidangStudi] },
      timestamp: { $gte: timeLimit, $lt: timestamp },
    });

    if (classLogs.length === 0) {
      classLogs = await ClassLogSchema.find({
      class_name: { $in: [req.body.class_name, bidangStudi] },
      timestamp: {$lt: timestamp },
      }).sort({ timestamp: -1 }).limit(1);
    }

    let personalLogs = await PersonalLogSchema.find({
      studentId: req.body.id,
      timestamp: { $gte: timeLimit, $lt: timestamp },
    });

    if (personalLogs.length === 0) {
      personalLogs = await PersonalLogSchema.find({
      studentId: req.body.id,
      timestamp: {$lt: timestamp },
      }).sort({ timestamp: -1 }).limit(1);
    }

    let chats = await ChatSchema.find({
      studentId: req.body.id,
      timestamp: { $gte: timeLimit, $lt: timestamp },
    });

    // Combine the logs
    let combinedLogs = [...classLogs, ...personalLogs, ...chats];
    combinedLogs.sort((a, b) => a.timestamp - b.timestamp);

    const writterUsernames = combinedLogs
      .filter((log) => log.type === "chat")
      .map((log) => log.writter);

    if (writterUsernames.length > 0) {
      // Fetch display names for writers
      const { rows: displayNames } = await neonPool.query(
        `SELECT username, display_name FROM users WHERE username IN (${writterUsernames
          .map((_, i) => `$${i + 1}`)
          .join(", ")})`,
        writterUsernames
      );

      // Create a mapping of usernames to display names
      const displayNameMap = displayNames.reduce(
        (acc, { username, display_name }) => {
          acc[username] = display_name;
          return acc;
        },
        {}
      );

      // Update the logs with display names
      combinedLogs.forEach((log) => {
        if (log.type === "chat") {
          log.writter = displayNameMap[log.writter] || log.writter;
        }
      });
    }

    if (req.user.role === "teacher") {
      await neonPool.query(
        `UPDATE notifications SET for_teacher = 0 WHERE student_id = $1`,
        [req.body.id]
      );
    } else if (req.user.role === "parent") {
      await neonPool.query(
        `UPDATE notifications SET for_parent = 0 WHERE student_id = $1`,
        [req.body.id]
      );
    }

    combinedLogs.forEach((log) => {
      if (log.image) {
        log.image.forEach((image, index) => {
          log.image[index] = `${process.env.BASE_URL_IMAGE}/${image}`;
        });
      }
    });

    return combinedLogs;
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteAllLogs = async function () {
  try {
    await ClassLogSchema.deleteMany({});
    await PersonalLogSchema.deleteMany({});
    await ChatSchema.deleteMany({});
    return {
      message: "All logs deleted",
    };
  } catch (error) {
    throw new Error(error);
  }
};
