import React, { useEffect, useState } from "react";
import "../StudentFeatures/Courses/Courses.css";
import Navbar from '../NavigationBar/Navbar'; 

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          "http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getTeacherCourses.php",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setCourses(data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error fetching courses");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="courses-page">Loading...</div>;
  if (error) return <div className="courses-page">{error}</div>;

  return (
    <div className="courses-page">
      <Navbar />
      <div className="courses-card">
            <h1 className="courses-header">My Courses</h1>
        <div className="courses-table-wrapper">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Type</th>
                <th>Enrolled Students</th>
                <th>Sessions per semester</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.course_id}>
                  <td>{course.course_name}</td>
                  <td>{course.course_type}</td>
                  <td>{course.enrolled_students}</td>
                  <td>{course.sessions_per_semester}</td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherCourses;
