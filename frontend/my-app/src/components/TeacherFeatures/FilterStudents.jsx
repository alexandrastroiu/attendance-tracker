import React, { useEffect, useState } from "react";
import "./FilterStudents.css";
import Navbar from "../NavigationBar/Navbar";

const FilterStudents = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errorCourses, setErrorCourses] = useState(null);
  const [errorStudents, setErrorStudents] = useState(null);

  // Fetch courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getTeacherCourses.php",
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.error) {
          setErrorCourses(data.error);
        } else {
          setCourses(data);
        }
      } catch (err) {
        setErrorCourses("Failed to fetch courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch students when a course is selected
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchStudents = async () => {
      setLoadingStudents(true);
      setErrorStudents(null);
      try {
        const response = await fetch(
          `http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getAbsentStudents.php?course_id=${selectedCourse}`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.error) {
          setErrorStudents(data.error);
          setStudents([]);
        } else {
          setErrorStudents(null);
          setStudents(data);
        }
      } catch (err) {
        setErrorStudents("Failed to fetch students");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  return (
    <div className="filter-students-page">
      <Navbar />
      <div className="filter-students-card">
        <h1 className="filter-students-header">
          Students exceeding allowed absences
        </h1>

        {/* Course dropdown */}
        <div className="select-container">
          <label className="select-label" htmlFor="course-select">
            Select Course:
          </label>
          <select
            id="course-select"
            className="filter-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">--Choose a course--</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        {/* Students table */}
        {loadingStudents && <p className="message-text">Loading students...</p>}
        {errorStudents && (
          <p className="message-text" style={{ color: "red" }}>
            {errorStudents}
          </p>
        )}

        {!loadingStudents && !errorStudents && students.length > 0 && (
          <div className="table-wrapper">
            <table className="filter-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Group</th>
                  <th>Total Absences</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.student_id}>
                    <td>{student.first_name}</td>
                    <td>{student.last_name}</td>
                    <td>{student.group_name}</td>
                    <td>{student.total_absences}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loadingStudents && selectedCourse && students.length === 0 && (
          <p className="message-text">No students found for this course.</p>
        )}
      </div>
    </div>
  );
};

export default FilterStudents;
