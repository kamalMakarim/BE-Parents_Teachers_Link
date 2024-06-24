const neonPool = require("../config/neon.config");
const bcrypt = require("bcrypt");

exports.getUser = async (username) => {
  try {
    const { rows: user } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return {
      display_name: user[0].display_name,
      role: user[0].role,
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.addUser = async (body) => {
  try {
    // Validate request
    const { username, password, display_name, role } = body;
    if (!username) throw new Error("Please provide username");
    if (username.length < 3 || username.length > 20)
      throw new Error(
        "Username must be at least 3 characters and at most 20 characters"
      );
    if (!password) throw new Error("Please provide password");
    if (!display_name) throw new Error("Please provide display name");
    if (display_name.length < 3 || display_name.length > 30)
      throw new Error(
        "Display name must be at least 3 characters and at most 30 characters"
      );
    if (!role) throw new Error("Please provide role");
    
    // Check if user already exists in the database
    const { rows: userExists } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    if (userExists.length > 0) throw new Error("User already exists");
    if (role == "teacher") {
      if (!body.className) throw new Error("Please provide class name");
      const { rows: teacher } = await neonPool.query(
        `SELECT * FROM teachers WHERE username = $1`,
        [username]
      );
      if (teacher.length > 0) throw new Error("Teacher already exists");
    }

    // Check if username and password are valid
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!usernameRegex.test(username))
      throw new Error("Username must be alphanumeric and can contain _ and -");
    if (!passwordRegex.test(password))
      throw new Error("Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter and 1 number");
    
    // Hash password and add user to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows: user } = await neonPool.query(
      `INSERT INTO users (username, password, display_name, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, hashedPassword, display_name, role]
    );

    // Add teacher to the teachers table
    if (role == "teacher") {
      await neonPool.query(
        `INSERT INTO teachers (username, className) VALUES ($1, $2)`,
        [username, body.className]
      );
    }

    // Remove password from the response and giving the response
    user[0].password = undefined;
    return { message: "User added successfully", data: user[0] };
  } catch (error) {
    throw new Error(error);
  }
};
