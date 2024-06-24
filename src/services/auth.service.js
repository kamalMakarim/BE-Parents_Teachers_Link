const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const neonPool = require("../config/neon.config");

exports.login = async (body) => {
  try {
    const { username, password } = body;
    if (!username) throw new Error("Please provide username");
    if (!password) throw new Error("Please provide password");
    const { rows: user } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    if(user.length === 0) throw new Error("Wrong username or password");

    const validPassword = await bcrypt.compare(password, user[0].password);

    if (!validPassword) throw new Error("Wrong username or password");
    const token = jwt.sign(
      {role: user[0].role, username: user[0].username},
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      message: "Login successful",
      token,
      data: { username: user[0].username, display_name: user[0].display_name, role: user[0].role },
    };
  } catch (error) {
    return { message: error.message };
  }
};
