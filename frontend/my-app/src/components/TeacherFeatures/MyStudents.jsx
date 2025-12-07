import React, { useEffect, useState } from "react";
import "./MyStudents.css"; // make a new CSS file or reuse styling
import Navbar from "../NavigationBar/Navbar";

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          "http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getTeacherStudents.php",
          {
            method: "GET",
            credentials: "include", // include session cookies
          }
        );
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setStudents(data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error fetching students");
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <div className="students-page">Loading...</div>;
  if (error) return <div className="students-page">{error}</div>;

  return (
    <div className="students-page">
      <Navbar/>
      <div className="students-card">
        <h1 className="students-header">My Students</h1>
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Group Name</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.student_id}>
                  <td>{index + 1}</td>
                  <td>{student.student_name}</td>
                  <td>{student.group_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyStudents;