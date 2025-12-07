import React, { useEffect, useState } from "react";
import "./MarkAttendance.css";
import Navbar from '../NavigationBar/Navbar';

const TeacherMarkAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); 

  
  useEffect(() => {
    fetch("http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getTeacherCourses.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
       
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data.error) {
          setCourses([]); 
          setError(data.error); 
        }
      })
      .catch(err => {
        console.error(err);
        setCourses([]);
        setError("Error fetching courses");
      });
  }, []);

  
  const handleSelectCourse = (course_id) => {
    setSelectedCourse(course_id);
    setSelectedSession("");
    setStudents([]);
    setError(""); 

    fetch(`http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getSessions.php?course_id=${course_id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSessions(data);
        } else if (data.error) {
          setSessions([]);
          setError(data.error);
        }
      })
      .catch(err => {
        console.error(err);
        setSessions([]);
        setError("Error fetching sessions");
      });
  };

  
  const handleSelectSession = (session_id) => {
    setSelectedSession(session_id);
    setError(""); 

    fetch(`http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getSessionStudents.php?session_id=${session_id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);

        
          const initialData = {};
          data.forEach(stu => initialData[stu.student_id] = stu.attendance_status ?? "present");
          setAttendance(initialData);
        } else if (data.error) {
          setStudents([]);
          setError(data.error);
        }
      })
      .catch(err => {
        console.error(err);
        setStudents([]);
        setError("Error fetching students");
      });
  };

 
  const setStudentAttendance = (student_id, status) => {
    setAttendance({
      ...attendance,
      [student_id]: status,
    });
  };

  
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
        setMessage(data.success ? "Attendance saved." : data.error || "Error saving attendance.");
        setTimeout(() => setMessage(""), 5000); 
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="mark-attendance-page">
      <Navbar />
      <div className="mark-attendance-card">
        <h1 className="mark-attendance-header">Mark Attendance</h1>

        {error && <p className="error-text">{error}</p>}

        <div className="select-container">
          <div className="selection">
            <label className="select-label">Select a course:</label>
            <select className="mark-attendance-select" value={selectedCourse} onChange={(e) => handleSelectCourse(e.target.value)}>
              <option value="">-- Select Course --</option>
              {courses.length > 0
                ? courses.map((c, index) => (
                    <option key={index} value={c.course_id}>{c.course_name}</option>
                  ))
                : <option value="">No courses available</option>
              }
            </select>
          </div>

          {sessions.length > 0 && (
            <div className="selection">
              <label className="select-label">Select a session:</label>
              <select className="mark-attendance-select" value={selectedSession} onChange={(e) => handleSelectSession(e.target.value)}>
                <option value="">-- Select date --</option>
                {sessions.map((s, index) => (
                  <option key={index} value={s.session_id}>{s.session_date}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Excused</th>
                </tr>
              </thead>
              <tbody>
                {students.map(stu => (
                  <tr key={stu.student_id}>
                    <td>{stu.student_name}</td>
                    <td>
                      <input type="radio" name={`att-${stu.student_id}`} checked={attendance[stu.student_id] === "present"} onChange={() => setStudentAttendance(stu.student_id, "present")} />
                    </td>
                    <td>
                      <input type="radio" name={`att-${stu.student_id}`} checked={attendance[stu.student_id] === "absent"} onChange={() => setStudentAttendance(stu.student_id, "absent")} />
                    </td>
                    <td>
                      <input type="radio" name={`att-${stu.student_id}`} checked={attendance[stu.student_id] === "excused"} onChange={() => setStudentAttendance(stu.student_id, "excused")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {students.length > 0 && (
          <button className="save-button" onClick={submitAttendance}>Save Attendance</button>
        )}

        {message && <p className="message-text">{message}</p>}
      </div>
    </div>
  );
};

export default TeacherMarkAttendance;
