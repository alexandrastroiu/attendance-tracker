-- Create database
CREATE DATABASE IF NOT EXISTS attendance_management
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_0900_ai_ci;
USE attendance_management;

-- Create table: Users
CREATE TABLE Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  user_role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  user_email VARCHAR(50) UNIQUE
);

-- Create table: Departments
CREATE TABLE Departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(50) NOT NULL UNIQUE

);

-- Create table: Student_Groups
CREATE TABLE Student_Groups (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  group_name VARCHAR(50) NOT NULL UNIQUE

);

-- Create table: Teachers
CREATE TABLE Teachers (
  teacher_id INT AUTO_INCREMENT PRIMARY KEY,
  last_name VARCHAR(50) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  department_id INT NOT NULL,
  user_id INT NOT NULL UNIQUE,
  FOREIGN KEY (department_id) REFERENCES Departments(department_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Create table: Students
CREATE TABLE Students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  last_name VARCHAR(50) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  group_id INT NOT NULL,
  user_id INT NOT NULL UNIQUE,
  FOREIGN KEY (group_id) REFERENCES Student_Groups(group_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Create table: Courses
 CREATE TABLE Courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(50) NOT NULL UNIQUE,
  course_type ENUM('mandatory','optional','elective') DEFAULT 'mandatory',
  teacher_id INT NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id)
 );

-- Create table: Course_Sessions
 CREATE TABLE Course_Sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration TIME DEFAULT '02:00:00',
  FOREIGN KEY (course_id) REFERENCES Courses(course_id)
 );

-- Create table: Course_Enrollment
 CREATE TABLE Course_Enrollment (
student_id INT NOT NULL,
course_id INT NOT NULL,
enrollment_type ENUM('active','repetition') DEFAULT 'active',
PRIMARY KEY (student_id, course_id),
FOREIGN KEY (student_id) REFERENCES Students(student_id),
FOREIGN KEY (course_id) REFERENCES Courses(course_id)
 );

-- Create table: Attendance
 CREATE TABLE Attendance (
  session_id INT NOT NULL,
  student_id INT NOT NULL,
  attendance_status ENUM('present','absent','excused') DEFAULT 'absent',
  PRIMARY KEY (session_id, student_id),
  FOREIGN KEY (session_id) REFERENCES Course_Sessions(session_id),
  FOREIGN KEY (student_id) REFERENCES Students(student_id)
 );