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

    const studentIds = students.map(student => student.id);
    const { rows: notifications } = await neonPool.query(
      `SELECT student_id, for_parent FROM notifications WHERE student_id IN (${studentIds.map((_, i) => `$${i + 1}`).join(', ')})`,
      studentIds
    );

    const notificationMap = notifications.reduce((acc, notification) => {
      acc[notification.student_id] = notification.for_parent;
      return acc;
    }, {});

    students = students.map(student => {
      student.notification = notificationMap[student.id] || null;
      return student;
    });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentClass = async (req, res) => {
  try {
    const { rows: teacher } = await neonPool.query(
      `SELECT * FROM teachers WHERE username = $1 LIMIT 1`,
      [req.user.username]
    );
    if (teacher.length === 0) {
      throw new Error("You are not a teacher");
    }
    let students = await studentServices.getStudentClass(teacher[0].class_name, req.query);

    const studentIds = students.map(student => student.id);
    const { rows: notifications } = await neonPool.query(
      `SELECT student_id, for_teacher FROM notifications WHERE student_id IN (${studentIds.map((_, i) => `$${i + 1}`).join(', ')})`,
      studentIds
    );

    const notificationMap = notifications.reduce((acc, notification) => {
      acc[notification.student_id] = notification.for_teacher;
      return acc;
    }, {});

    students = students.map(student => {
      student.notification = notificationMap[student.id] || null;
      return student;
    });

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