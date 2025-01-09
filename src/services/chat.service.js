const ChatSchema = require("../models/chat.model");
const neonPool = require("../config/neon.config");

exports.createChat = async function (req, res) {
  const { message, studentId } = req.body;
  if (!message || !studentId) {
    return {
      message: "All fields are required",
    };
  }
  const writter = req.user.username;
  try {
    let chat = new ChatSchema({
      message: message,
      writter: writter,
      studentId: studentId,
      image: req.body.image || null,
    });
    await chat.save();

    if (req.user.role === "parent") {
      await neonPool.query(
        "UPDATE notifications SET for_teacher = for_teacher + 1 WHERE student_id = $1",
        [studentId]
      );
    } else {
      await neonPool.query(
        "UPDATE notifications SET for_parent = for_parent + 1 WHERE student_id = $1",
        [studentId]
      );
    }
    const { rows: display_name } = await neonPool.query(
      `SELECT display_name FROM users WHERE username = $1 LIMIT 1`,
      [chat.writter]
    );
    chat.writter = display_name[0].display_name;
    chat.type = "chat";
    if(chat.image.length > 0){
      chat.image = chat.image.map((image) => {
        return `${process.env.BASE_URL_IMAGE}/${image}`;
      });
    }
    return {
      message: "Chat created",
      data: chat,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

exports.getChats = async function (req, res) {
  const { studentId } = req.query;
  try {
    const chats = await ChatSchema.find({ studentId: studentId });
    chats.forEach((chat) => {
      if (chat.image) {
        chat.image = `${process.env.BASE_URL_IMAGE}/${chat.image}`;
      }
    });
    return {
      message: "Chats found",
      data: chats,
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteChat = async function (req, res) {
  const { chatId } = req.query;
  try {
    await ChatSchema.findByIdAndDelete(chatId);
    return {
      message: "Chat deleted",
    };
  } catch (error) {
    throw new Error(error);
  }
};
