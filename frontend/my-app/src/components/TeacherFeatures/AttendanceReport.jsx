import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./AttendanceReport.css";

// 12-group color palette
const GROUP_COLORS = [
  "#6419f0", "#FF6384", "#36A2EB", "#FFCE56",
  "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF",
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042"
];

// Colors for total attendance
const TOTAL_COLORS = ["#6419f0", "#FFCE56"];

export default function AttendanceReport() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [rateType, setRateType] = useState("total"); // "total" or "group"
  const [totalData, setTotalData] = useState(null);
  const [groupData, setGroupData] = useState([]);

  // Fetch courses for logged-in teacher
  useEffect(() => {
    fetch("http://localhost:8888/attendance-tracker/backend/api/teacher/getTeacherCourses.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(console.error);
  }, []);

  // Fetch attendance data when course or rate type changes
  useEffect(() => {
    if (!selectedCourse) return;

    const group_id = rateType === "total" ? 0 : -1; // 0 = total, -1 = all groups
    const url = `http://localhost:8888/attendance-tracker/backend/api/teacher/getAttendanceRate.php?course_id=${selectedCourse}&group_id=${group_id}`;

    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (rateType === "total") {
          setTotalData(data);
          setGroupData([]);
        } else {
          setGroupData(data.groups || []);
          setTotalData(null);
        }
      })
      .catch(console.error);
  }, [selectedCourse, rateType]);

  // Prepare chart data
  const chartData = totalData
    ? [
        { name: "Attendance", value: parseFloat(totalData.attendance_rate) },
        { name: "Missing", value: 100 - parseFloat(totalData.attendance_rate) },
      ]
    : groupData.map((g, idx) => ({
        name: g.group,
        value: parseFloat(g.attendance_rate),
      }));

  const colors = totalData ? TOTAL_COLORS : GROUP_COLORS;

  return (
    <div className="attendance-report-page">
      <h1 className="attendance-report-header">Attendance Report</h1>

      <div className="attendance-report-controls">
        {/* Course dropdown */}
        <div>
          <label className="attendance-report-label">Course: </label>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="attendance-report-select"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        {/* Rate type dropdown */}
        <div>
          <label className="attendance-report-label">Rate: </label>
          <select
            value={rateType}
            onChange={e => setRateType(e.target.value)}
            className="attendance-report-select"
          >
            <option value="total">Total</option>
            <option value="group">By Group</option>
          </select>
        </div>
      </div>

      {/* Pie chart */}
      {chartData.length > 0 ? (
        <PieChart width={500} height={400}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      ) : (
        <p className="attendance-report-message">No attendance data</p>
      )}
    </div>
  );
}
