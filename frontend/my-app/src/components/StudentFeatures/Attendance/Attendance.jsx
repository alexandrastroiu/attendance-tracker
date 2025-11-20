import React, { useEffect, useState } from "react";
import "./Attendance.css";

const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all courses student is enrolled in
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          "http://localhost:8888/management_attendance/attendance-tracker/backend/api/student/getCourses.php",
          { credentials: "include" }
        );
        const data = await res.json();
        if (!data.error) {
          setCourses(data);
          if (data.length > 0) setSelectedCourse(data[0].course_id); // default to first course
        } else {
          setError(data.error);
        }
      } catch {
        setError("Failed to fetch courses");
      }
    };
    fetchCourses();
  }, []);

  // Fetch attendance whenever course or filter changes
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8888/management_attendance/attendance-tracker/backend/api/student/getAttendance.php?course_id=${selectedCourse}&sort=${filter}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!data.error) setAttendance(data);
        else setError(data.error);
      } catch {
        setError("Failed to fetch attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedCourse, filter]);

  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (loading)
    return <p style={{ textAlign: "center" }}>Loading attendance...</p>;

  return (
    <div className="attendance-page">
      <h1 className="attendance-header">Attendance</h1>

      <div className="attendance-controls">
        <label>
          Select Course:{" "}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Filter:{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="absences">Absences Only</option>
          </select>
        </label>
      </div>

      <div className="attendance-card">
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Session Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center" }}>
                    No sessions found.
                  </td>
                </tr>
              ) : (
                attendance.map((att, index) => (
                  <tr key={index}>
                    <td>{att.session_date}</td>
                    <td>{att.attendance_status}</td> {/* keep null as null */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
