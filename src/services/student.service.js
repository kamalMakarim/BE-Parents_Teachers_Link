const neonPool = require("../config/neon.config");

exports.addStudent = async (body) => {
  const { name, batch, parent_username, class_name } = body;
  try {
    // Validate request
    if (!name || !batch || !parent_username || !class_name) {
      throw new Error("All fields are required");
    }

    // Check if parent exists
    const { rows: parent } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1 LIMIT 1`,
      [parent_username]
    );
    if (parent.length === 0) {
      throw new Error("Parent does not exist");
    }

    //Insert student into database
    const { rows: students } = await neonPool.query(
      `INSERT INTO students (name, batch, parent_username, class_name) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, batch, parent_username, class_name]
    );
    await neonPool.query(
      "INSERT INTO notifications (student_id, for_teacher, for_parent) VALUES ($1, $2, $3)",
      [students[0].id, 0, 0]
    );
    return { message: "Student added" };
  } catch (error) {
    throw new Error(error);
  }
};

exports.getStudentsOfParent = async (parent_username) => {
  try {
    const { rows: students } = await neonPool.query(
      `SELECT * FROM students WHERE parent_username = $1`,
      [parent_username]
    );
    return students;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllStudent = async () => {
  try {
    const { rows: student } = await neonPool.query(`SELECT * FROM students`);
    return student;
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteStudent = async (id) => {
  try {
    await neonPool.query(`DELETE FROM students WHERE id = $1`, [id]);
    await neonPool.query(`DELETE FROM notifications WHERE student_id = $1`, [
      id,
    ]);
    return { message: "Student deleted" };
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateStudent = async (body) => {
  const { id, name, batch, parent_username, class_name } = body;
  try {
    // Validate request
    if (!id || !name || !batch || !parent_username || !class_name) {
      throw new Error("All fields are required");
    }

    // Check if parent exists
    const { rows: parent } = await neonPool.query(
      `SELECT * FROM users WHERE username = $1 LIMIT 1`,
      [parent_username]
    );
    if (parent.length === 0) {
      throw new Error("Parent does not exist");
    }

    // Update student in the database
    await neonPool.query(
      `UPDATE students SET name = $1, batch = $2, parent_username = $3, class_name = $4 WHERE id = $5`,
      [name, batch, parent_username, class_name, id]
    );
    return { message: "Student updated" };
  } catch (error) {
    throw new Error(error);
  }
};

exports.getStudentClass = async (class_name, body) => {
  try {
    if (class_name === "Bidang Study TK" || class_name === "Bidang Study SD") {
      if (!body.class_name) {
        throw new Error("Class name is required");
      }
      const { rows: students } = await neonPool.query(
        `SELECT * FROM students WHERE class_name = $1`,
        [body.class_name]
      );
      return students;
    } else {
      const { rows: students } = await neonPool.query(
        `SELECT * FROM students WHERE class_name = $1`,
        [class_name]
      );
      return students;
    }
  } catch (error) {
    throw new Error(error);
  }
};
