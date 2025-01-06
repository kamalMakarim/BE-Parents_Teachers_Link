const ClassLogSchema = require("../models/classLog.model");
const PersonalLogSchema = require("../models/personalLog.model");
const ChatSchema = require("../models/chat.model");
const neonPool = require("../config/neon.config");

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
        `SELECT class_name FROM teachers WHERE username = $1`,
        [writter]
      );
      const { rows: students } = await neonPool.query(
        `SELECT id FROM students WHERE class_name = $1`,
        [class_name[0].class_name]
      );
      await Promise.all(
        students.map(async (student) => {
          await neonPool.query(
            `UPDATE notifications SET for_parent = for_parent + 1 WHERE student_id = $1`,
            [student.id]
          );
        })
      );
      const log = new ClassLogSchema({
        message,
        type,
        writter,
        class_name: class_name[0].class_name,
        image: req.body.image,
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
        `SELECT id FROM students WHERE ${class_notifcation_update.map((_, i) => `class_name = $${i + 1}`).join(' OR ')}`,
        class_notifcation_update
      );
      await Promise.all(
        students.map(async (student) => {
          await neonPool.query(
            `UPDATE notifications SET for_parent = for_parent + 1 WHERE student_id = $1`,
            [student.id]
          );
        })
      );
      const log = new ClassLogSchema({
        message,
        type,
        writter,
        class_name: class_name,
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
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

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
    const logs = await Promise.all([
      ClassLogSchema.find({
        class_name: { $in: [req.body.class_name, bidangStudi] },
        timestamp: { $gte: oneMonthAgo },
      }),
      PersonalLogSchema.find({
        studentId: req.body.id,
        timestamp: { $gte: oneMonthAgo },
      }),
      ChatSchema.find({
        studentId: req.body.id,
        timestamp: { $gte: oneMonthAgo },
      }),
    ]).then(async ([classLogs, personalLogs, chats]) => {
      const combinedLogs = [...classLogs, ...personalLogs, ...chats];
      combinedLogs.sort((a, b) => a.timestamp - b.timestamp);
      await Promise.all(
        combinedLogs.map(async (log) => {
          if (!log.type) {
            const { rows: display_name } = await neonPool.query(
              `SELECT display_name FROM users WHERE username = $1`,
              [log.writter]
            );
            log.writter = display_name[0].display_name;
          }
        })
      );
      return combinedLogs;
    });

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

    logs.forEach((log) => {
      if (log.image) {
        log.image = `${process.env.BASE_URL_IMAGE}/${log.image}`;
      }
    });

    return logs;
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
