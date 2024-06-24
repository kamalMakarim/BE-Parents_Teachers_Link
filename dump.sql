DROP TABLE IF EXISTS users, teachers, classes;
DROP TYPE IF EXISTS role;

CREATE TYPE role AS ENUM ('admin', 'teacher', 'parent');
CREATE TABLE users (
    username VARCHAR(20) NOT NULL UNIQUE,
    display_name VARCHAR(30) NOT NULL,
    password VARCHAR(60) NOT NULL,
    role role NOT NULL
);

CREATE TABLE classes (
    name VARCHAR(36) UNIQUE NOT NULL,
    students VARCHAR(36)[]
);

CREATE TABLE teachers (
    username VARCHAR(36) REFERENCES users(username) ON DELETE CASCADE,
    className VARCHAR(36) REFERENCES classes(name) ON DELETE CASCADE NOT NULL
);

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    name VARCHAR(30) NOT NULL,
    batch INTEGER NOT NULL,
    parentUsername VARCHAR(36) REFERENCES users(username) ON DELETE CASCADE
);

INSERT INTO classes (name, students) VALUES 
('Red', '{}'),
('Blue', '{}'),
('Green', '{}'),
('Yellow', '{}'); 

