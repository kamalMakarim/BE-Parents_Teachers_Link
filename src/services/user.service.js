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
      if (!body.class_name) throw new Error("Please provide class name");
      const { rows: teacher } = await neonPool.query(
        `SELECT * FROM teachers WHERE username = $1`,
        [username]
      );
      if (teacher.length > 0) throw new Error("Teacher already exists");
    }

    // Check if username and password are valid
    const usernameRegex = /^[a-zA-Z0-9_.-]{3,20}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{8,20}$/;
    if (!usernameRegex.test(username))
      throw new Error(
        `Usernnme must be alphanumeric and can contain ".", "_", "-"`
      );
    if (!passwordRegex.test(password))
      throw new Error(
        "Password must contain at least 8 characters, 1 lowercase letter and 1 number"
      );

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
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{8,20}$/;
    if (!passwordRegex.test(new_password))
      throw new Error(
        "Password must contain at least 8 characters and 20 characters max, 1 lowercase letter and 1 number"
      );
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
      `SELECT * FROM users WHERE username = $1`,
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
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(new_password))
      throw new Error(
        "Password must contain at least 8 characters, 1 lowercase letter and 1 number"
      );

    // Check if user exists in the database
    const { rows: userExists } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1`,
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
    const { rows: users } = await neonPool.query(`SELECT * FROM users`);
    users.forEach((user) => {
      user.password = undefined;
    });
    await Promise.all(
      users.map(async (user) => {
        if (user.role == "teacher") {
          const { rows: teacher } = await neonPool.query(
            `SELECT * FROM teachers WHERE username = $1`,
            [user.username]
          );
          user.class_name = teacher[0].class_name;
        }else if (user.role == "parent") {
          const { rows: students } = await neonPool.query(
            `SELECT * FROM students WHERE parent_username = $1`,
            [user.username]
          );
          user.students = students;
        }
        return user;
      })
    );
    return users;
  } catch (error) {
    throw new Error(error);
  }
};
