const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const neonPool = require("../config/neon.config");

exports.login = async (body) => {
  try {
    const { username, password } = body;
    if (!username) throw new Error("Please provide username");
    if (!password) throw new Error("Please provide password");
    let { rows: user } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1 LIMIT 1`,
      [username]
    );
    if(user.length === 0) throw new Error("Wrong username or password");

    const validPassword = await bcrypt.compare(password, user[0].password);

    if (!validPassword) throw new Error("Wrong username or password");
    const token = jwt.sign(
      {role: user[0].role, username: user[0].username},
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    if(user[0].role === 'teacher') {
      const { rows: teacher } = await neonPool.query(
        `SELECT class_name FROM teachers WHERE username = $1 LIMIT 1`,
        [user[0].username]
      );
      user[0].class_name = teacher[0].class_name;
    }

    return {
      message: "Login successful",
      token,
      data: { username: user[0].username, display_name: user[0].display_name, role: user[0].role, class_name: user[0].class_name },
    };
  } catch (error) {
    return { message: error.message };
  }
};
