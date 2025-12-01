import React, { useEffect, useState } from 'react';
import './Courses.css';
import Navbar from '../../NavigationBar/Navbar';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          'http://localhost:8888/management_attendance/attendance-tracker/backend/api/student/getCourses.php',
          {
            method: 'GET',
            credentials: 'include', // important: sends PHP session cookie
          }
        );

        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setCourses(data);
        }
      } catch (err) {
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading courses...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;

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
          <th>Enrollment</th>
          <th>Teacher</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course, index) => (
          <tr key={index}>
            <td>{course.course_name}</td>
            <td>{course.course_type}</td>
            <td>{course.enrollment_type}</td>
            <td>{course.teacher_name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
</div>

  );
};

export default Courses;
