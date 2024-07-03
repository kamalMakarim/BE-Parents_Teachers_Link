const ChatSchema = require("../models/chat.model");
const neonPool = require("../config/neon.config");

exports.createChat = async function (req, res) {
  const { message, studentId } = req.body;
  console.log(req.body);
  if (!message || !studentId) {
    return {
      message: "All fields are required",
    };
  }
  const writter = req.user.username;

  try {
    const chat = new ChatSchema({
      message: message,
      writter: writter,
      studentId: studentId,
    });
    await chat.save();

    if(req.user.role === 'parent') {
      await neonPool.query('UPDATE notifications SET for_teacher = for_teacher + 1 WHERE student_id = $1', [studentId]);
    }else {
      await neonPool.query('UPDATE notifications SET for_parent = for_parent + 1 WHERE student_id = $1', [studentId]);
    }
    return {
      message: "Chat created",
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.getChats = async function (req, res) {
  const { studentId } = req.query;
  try {
    const chats = await ChatSchema.find({studentId: studentId });
    return {
      message: "Chats found",
      data: chats,
    };
  } catch (error) {
    throw new Error(error);
  }
};
