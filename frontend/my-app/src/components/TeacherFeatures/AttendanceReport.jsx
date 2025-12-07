import React, { useState, useEffect } from "react";
import "./AttendanceReport.css";
import Navbar from '../NavigationBar/Navbar';

const GROUPS = [
  { id: 1, name: "CS1A" }, { id: 2, name: "CS1B" },
  { id: 3, name: "CS1C" }, { id: 4, name: "CS1D" },
  { id: 5, name: "CS2A" }, { id: 6, name: "CS2B" },
  { id: 7, name: "CS2C" }, { id: 8, name: "CS2D" },
  { id: 9, name: "CS3A" }, { id: 10, name: "CS3B" },
  { id: 11, name: "CS3C" }, { id: 12, name: "CS3D" }
];

export default function AttendanceReport() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(0); 
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(
      "http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getTeacherCourses.php",
      { credentials: "include" }
    )
      .then(res => res.json())
      .then(data => {
        
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          setCourses([]); 
          console.warn(data.error || "No courses returned");
        }
      })
      .catch(err => {
        console.error(err);
        setCourses([]); 
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    setLoading(true);
    setAttendanceData(null);

    const groupId = parseInt(selectedGroup); 
    const url = `http://localhost:8888/management_attendance/attendance-tracker/backend/api/teacher/getAttendanceRate.php?course_id=${selectedCourse}&group_id=${groupId}`;

    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        console.log("Attendance data:", data)
        setAttendanceData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCourse, selectedGroup]);

  const renderBlocks = () => {
    if (!attendanceData) return null;

    const present = attendanceData.total_attendaces;
    const absent =
      attendanceData.total_students * attendanceData.total_classes - present;
    const attendanceRate = parseFloat(attendanceData.attendance_rate).toFixed(2);
    const absentRate = (100 - parseFloat(attendanceData.attendance_rate)).toFixed(2);

    return (
      <div className="attendance-blocks">
        <div className="attendance-block present">
          <h2>Present</h2>
          <p>{present}</p>
          <p>{attendanceRate}%</p>
        </div>
        <div className="attendance-block absent">
          <h2>Absent</h2>
          <p>{absent}</p>
          <p>{absentRate}%</p>
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-report-page">
      <Navbar />
      <div className="attendance-report-card">
        <h1 className="attendance-report-header">Attendance Report</h1>

        <div className="attendance-report-controls">
          <div>
            <label className="attendance-report-label">Course: </label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="attendance-report-select"
            >
              <option value="">Select a course</option>
              {courses.length > 0 ? (
                courses.map(course => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))
              ) : (
                <option value="">No courses available</option>
              )}
            </select>
          </div>

          <div>
            <label className="attendance-report-label">Group: </label>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(parseInt(e.target.value))}
              className="attendance-report-select"
            >
              <option value={0}>Total</option>
              {GROUPS.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p className="attendance-report-message">Loading attendance...</p>}
        {renderBlocks()}
      </div>
    </div>
  );
}
