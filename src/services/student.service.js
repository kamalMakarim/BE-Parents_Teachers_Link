const neonPool = require("../config/neon.config");

exports.addStudent = async (body) => {
    const {name, batch, parentUsername} = body;
    try {
        // Validate request
        if (!name || !batch || !parentUsername) {
            throw new Error("All fields are required");
        }

        // Check if parent exists
        const {rows: parent} = await neonPool.query(`SELECT * FROM users WHERE username = $1`, [parentUsername]);
        if (parent.length === 0) {
            throw new Error("Parent does not exist");
        }

        //Insert student into database
        await neonPool.query(`INSERT INTO students (name, batch, parentUsername) VALUES ($1, $2, $3)`, [name, batch, parentUsername]);
        return {message: "Student added"};
    }
    catch (error) {
        throw new Error(error);
    }
}

exports.getStudentsOfParent = async (parentUsername) => {
    try {
        const {rows: students} = await neonPool.query(`SELECT * FROM students WHERE parentUsername = $1`, [parentUsername]);
        return students;
    }
    catch (error) {
        throw new Error(error);
    }
}

exports.getStudent = async (studentId) => {
    try {
        const {rows: student} = await neonPool.query(`SELECT * FROM students WHERE id = $1`, [studentId]);
        return student;
    }
    catch (error) {
        throw new Error(error);
    }
}

exports.getStudentClass = async (className) => {
    try {
        const {rows: studentsId} =await neonPool.query(`SELECT students FROM classes WHERE name = $1`, [className]);
        const students = [];
        Promise.all(studentsId.map(async (studentId) => {
            const {rows: student} = await neonPool.query(`SELECT * FROM students WHERE id = $1`, [studentId]);
            students.push(student[0]);
        }));
        return students;
    }
    catch (error) {
        throw new Error(error);
    }
}

