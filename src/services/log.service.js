const ClassLogSchema = require("../models/classLog.model");
const PersonalLogSchema = require("../models/personalLog.model");
const neonPool = require("../config/neon.config");

exports.createLog = async function (req, res) {
  const { message, type } = req.body;
  if (!message || !type) {
    return res.status(400).json({ message: "All fields are required" });
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
      });
      await log.save();
      res.status(200).json({ message: "Log created" });
    } else {
      const { rows: className } = await neonPool.query(
        `SELECT className FROM teachers WHERE username = $1`,
        [writter]
      );
      const log = new ClassLogSchema({
        message,
        type,
        writter,
        className: className[0].classname,
      });
      await log.save();
      res.status(200).json({ message: "Log created" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLog = async function (req, res) {
  const { logId, personal} = req.query;
  try {
    if (personal === "false") {
      await ClassLogSchema.findByIdAndDelete(logId);
    } else {
      await PersonalLogSchema.findByIdAndDelete(logId);
    }
    res.status(200).json({ message: "Log deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLog = async function (req, res) {
  const { logId, personal } = req.query;
  const { message, type } = req.body;
  if (!message || !type) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    if (personal === "false") {
      await ClassLogSchema.findByIdAndUpdate(logId, { message, type });
    } else {
      await PersonalLogSchema.findByIdAndUpdate(logId, { message, type });
    }
    res.status(200).json({ message: "Log updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}