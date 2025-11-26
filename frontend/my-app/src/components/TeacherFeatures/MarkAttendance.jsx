import React, { useEffect, useState } from "react";
import "./MarkAttendance.css";

const TeacherMarkAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  // Load teacher courses
  useEffect(() => {
    fetch("http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getTeacherCourses.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  }, []);

  // Load sessions when course selected
  const handleSelectCourse = (course_id) => {
    setSelectedCourse(course_id);
    setSelectedSession("");
    setStudents([]);
    
    fetch(`http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getSessions.php?course_id=${course_id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.error(err));
  };

  // Load students when session selected
  const handleSelectSession = (session_id) => {
    setSelectedSession(session_id);

    fetch(`http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getSessionStudents.php?session_id=${session_id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setStudents(data);

        // Init attendance to default = present
        const initialData = {};
        data.forEach(stu => initialData[stu.student_id] = "present");
        setAttendance(initialData);
      })
      .catch(err => console.error(err));
  };

  // Handle selecting present/absent
  const setStudentAttendance = (student_id, status) => {
    setAttendance({
      ...attendance,
      [student_id]: status,
    });
  };

  // Submit attendance POST request
  const submitAttendance = () => {
    const payload = {
      session_id: selectedSession,
      attendance: Object.entries(attendance).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        status: status
      }))
    };

    fetch("http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/submitAttendance.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.success ? "✔ Attendance saved." : "❗ Error saving attendance.");
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="mark-attendance-page">
      <h1 className="mark-attendance-header">Mark Attendance</h1>

      <div className="mark-attendance-card">
        {/* Course selector */}
        <label>Select a course:</label>
        <select className="mark-attendance-select" value={selectedCourse} onChange={(e) => handleSelectCourse(e.target.value)}>
          <option value="">-- Select Course --</option>
          {courses.map((c, index) => (
            <option key={index} value={c.course_id}>{c.course_name}</option>
          ))}
        </select>

        {/* Session selector */}
        {sessions.length > 0 && (
          <>
            <label>Select a session:</label>
            <select className="mark-attendance-select" value={selectedSession} onChange={(e) => handleSelectSession(e.target.value)}>
              <option value="">-- Select date --</option>
              {sessions.map((s, index) => (
                <option key={index} value={s.session_id}>{s.session_date}</option>
              ))}
            </select>
          </>
        )}

        {/* Student attendance list */}
        {students.length > 0 && (
          <div className="mark-attendance-table-wrapper">
            <table className="mark-attendance-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Present</th>
                  <th>Absent</th>
                </tr>
              </thead>
              <tbody>
                {students.map(stu => (
                  <tr key={stu.student_id}>
                    <td>{stu.student_name}</td>
                    <td>
                      <input
                        type="radio"
                        name={`att-${stu.student_id}`}
                        checked={attendance[stu.student_id] === "present"}
                        onChange={() => setStudentAttendance(stu.student_id, "present")}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`att-${stu.student_id}`}
                        checked={attendance[stu.student_id] === "absent"}
                        onChange={() => setStudentAttendance(stu.student_id, "absent")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {students.length > 0 && (
          <button className="mark-attendance-button" onClick={submitAttendance}>Save Attendance</button>
        )}

        {message && <p className="mark-attendance-message">{message}</p>}
      </div>
    </div>
  );
};

export default TeacherMarkAttendance;
