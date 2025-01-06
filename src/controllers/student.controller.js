const studentServices = require("../services/student.service");
const neonPool = require("../config/neon.config");
exports.addStudent = async (req, res) => {
  try {
    const response = await studentServices.addStudent(req.body);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentsOfParent = async (req, res) => {
  try {
    let students = await studentServices.getStudentsOfParent(req.user.username);

    students = await Promise.all(
      students.map(async (student) => {
        const { rows: notifications } = await neonPool.query(
          `SELECT * FROM notifications WHERE student_id = $1`,
          [student.id]
        );
        student.notification = notifications[0].for_parent;
        return student;
      })
    );

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentClass = async (req, res) => {
  try {
    const { rows: teacher } = await neonPool.query(
      `SELECT * FROM teachers WHERE username = $1`,
      [req.user.username]
    );
    if (teacher.length === 0) {
      throw new Error("You are not a teacher");
    }
    let students = await studentServices.getStudentClass(teacher[0].class_name, req.query);

    students = await Promise.all(
      students.map(async (student) => {
        const { rows: notifications } = await neonPool.query(
          `SELECT * FROM notifications WHERE student_id = $1`,
          [student.id]
        );
        student.notification = notifications[0].for_teacher;
        return student;
      })
    );

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStudent = async (req, res) => {
  try {
    const students = await studentServices.getAllStudent();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    const response = await studentServices.deleteStudent(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.updateStudent = async (req, res) => {
  try {
    const response = await studentServices.updateStudent(req.body);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}