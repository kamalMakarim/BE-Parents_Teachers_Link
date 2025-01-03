DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

DROP TYPE IF EXISTS role;
DROP TYPE IF EXISTS classes;

CREATE TYPE role AS ENUM ('admin', 'teacher', 'parent');
CREATE TABLE users (
    username VARCHAR(20) NOT NULL UNIQUE,
    display_name VARCHAR(30) NOT NULL,
    password VARCHAR(60) NOT NULL,
    role role NOT NULL
);

CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE classes AS ENUM ('Blue Pinter Morning' , 'Blue Pinter Afternoon', 'Green Motekar', 'Green Wanter', 'Green Maher', 'Yellow Maher', 'Yellow Motekar', 'Yellow Wanter','Gumujeng','Someah','Rancage', 'Gentur','Daria','Calakan','Singer', 'Rancingeus','Jatmika', 'Gumanti','Marahmay', 'Rucita', 'Binangkit', 'Gumilang', 'Sonagar', 'Bidang Study TK', 'Bidang Study SD');

CREATE TABLE teachers (
    username VARCHAR(36) REFERENCES users(username) ON DELETE CASCADE,
    class_name classes NOT NULL
);

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    name VARCHAR(30) NOT NULL,
    batch INTEGER NOT NULL,
    parent_username VARCHAR(36) REFERENCES users (username) ON DELETE CASCADE,
    class_name classes NOT NULL
);

CREATE TABLE notifications (
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    for_teacher INTEGER NOT NULL,
    for_parent INTEGER NOT NULL
);