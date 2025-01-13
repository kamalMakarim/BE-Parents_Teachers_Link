const neonPool = require("../config/neon.config");
const bcrypt = require("bcrypt");

exports.getUser = async (username) => {
  try {
    const { rows: user } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1 LIMIT 1`,
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
      `SELECT * FROM users WHERE username = $1 LIMIT 1`,
      [username]
    );
    if (userExists.length > 0) throw new Error("User already exists");
    if (role == "teacher") {
      if (!body.class_name) throw new Error("Please provide class name");
      const { rows: teacher } = await neonPool.query(
        `SELECT * FROM teachers WHERE username = $1 LIMIT 1`,
        [username]
      );
      if (teacher.length > 0) throw new Error("Teacher already exists");
    }

    // Check if username and password are valid
    const usernameRegex = /^.{8,}$/;
    const passwordRegex = /^.{8,}$/;
    if (!usernameRegex.test(username))
      throw new Error("Username must be at least 8 characters long");
    if (!passwordRegex.test(password))
      throw new Error("Password must be at least 8 characters long");

    // Hash password and add user to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows: user } = await neonPool.query(
      `INSERT INTO users (username, password, display_name, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, hashedPassword, display_name, role]
    );

    // Add teacher to the teachers table
    if (role == "teacher") {
      await neonPool.query(
        `INSERT INTO teachers (username, class_name) VALUES ($1, $2)`,
        [username, body.class_name]
      );
    }

    // Remove password from the response and giving the response
    user[0].password = undefined;
    return { message: "User added successfully", data: user[0] };
  } catch (error) {
    throw new Error(error);
  }
};

exports.updatePasswordByUser = async (req, res) => {
  const { new_password } = req.body;
  try {
    // Validate request
    if (!new_password) throw new Error("Please provide new password");
    const passwordRegex = /^.{8,}$/;
    if (!passwordRegex.test(new_password))
      throw new Error("Password must be at least 8 characters long");

    const username = req.user.username;
    // Hash password and update user in the database
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await neonPool.query(`UPDATE users SET password = $1 WHERE username = $2`, [
      hashedPassword,
      username,
    ]);
    return { message: "Password updated successfully" };
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteUser = async (username) => {
  try {
    // Check if user exists in the database
    const { rows: userExists } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1 LIMIT 1`,
      [username]
    );
    if (userExists.length === 0) throw new Error("User does not exist");

    // Delete user from the database
    await neonPool.query(`DELETE FROM users WHERE username = $1`, [username]);
    return { message: "User deleted successfully" };
  } catch (error) {
    throw new Error(error);
  }
};

exports.updatePasswordByAdmin = async (body) => {
  const { username, new_password } = body;
  try {
    // Validate request
    if (!username) throw new Error("Please provide username");
    if (!new_password) throw new Error("Please provide new password");
    const passwordRegex = /^.{8,}$/;
    if (!passwordRegex.test(new_password))
      throw new Error("Password must be at least 8 characters long");

    // Check if user exists in the database
    const { rows: userExists } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1 LIMIT 1`,
      [username]
    );
    if (userExists.length === 0) throw new Error("User does not exist");

    // Hash password and update user in the database
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await neonPool.query(`UPDATE users SET password = $1 WHERE username = $2`, [
      hashedPassword,
      username,
    ]);
    return { message: "Password updated successfully" };
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateDisplayName = async (req, body) => {
  const { display_name } = body;
  try {
    // Validate request
    if (!display_name) throw new Error("Please provide display name");
    if (display_name.length < 3 || display_name.length > 30)
      throw new Error(
        "Display name must be at least 3 characters and at most 30 characters"
      );

    username = req.user.username;

    // Update display name in the database
    await neonPool.query(
      `UPDATE users SET display_name = $1 WHERE username = $2`,
      [display_name, username]
    );
    return {
      message: "Display name updated successfully",
      display_name: display_name,
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllUsers = async () => {
  try {
    const query = `
  SELECT 
    u.*, 
    CASE 
      WHEN u.role = 'teacher' THEN t.class_name
      ELSE NULL
    END AS class_name,
    CASE 
      WHEN u.role = 'parent' THEN (
        SELECT json_agg(s) 
        FROM students s 
        WHERE s.parent_username = u.username
      )
      ELSE NULL
    END AS students
  FROM users u
  LEFT JOIN teachers t ON t.username = u.username AND u.role = 'teacher'
`;

    const { rows: users } = await neonPool.query(query);

    // Remove sensitive information (like password) after the query
    users.forEach((user) => {
      user.password = undefined;
    });
    return users;
  } catch (error) {
    throw new Error(error);
  }
};
