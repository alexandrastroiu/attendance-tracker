import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login/Login";
import Home from "./components/HomePage/Home";
import Courses from "./components/StudentFeatures/Courses/Courses";
import Attendance from "./components/StudentFeatures/Attendance/Attendance";
import Profile from "./components/Profile/Profile";
import TeacherCourses from "./components/TeacherFeatures/TeacherCourses";
import MarkAttendance from "./components/TeacherFeatures/MarkAttendance";
import FilterStudents from "./components/TeacherFeatures/FilterStudents";
import AttendanceReport from "./components/TeacherFeatures/AttendanceReport";
import Users from "./components/AdminFeatures/AddRemoveUsers";
import ManageCourses from "./components/AdminFeatures/ManageCourses";
import ManageEnrollments from "./components/AdminFeatures/ManageEnrollment";
import ManageSessions from "./components/AdminFeatures/ManageSessions";
import Main from "./components/Mainpage/MainPage";
import MyStudents from "./components/TeacherFeatures/MyStudents";

function App() {
  //const userRole = localStorage.getItem('userRole'); // check if user is logged in
  //const [userRole, setUserRole] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route
          path="/login"
          element={
            <Login
              onLogin={() => setUserRole(localStorage.getItem("userRole"))}
            />
          }
        />

        {/* Home route, only accessible if logged in */}
        <Route
          path="/home"
          element={userRole ? <Home /> : <Navigate to="/login" />}
        />
        {/* Courses route */}
        <Route path="/courses" element={<Courses />} />
        {/* Attendance route */}
        <Route path="/attendance" element={<Attendance />} />
        {/* Profile route */}
        <Route
          path="/profile"
          element={userRole ? <Profile /> : <Navigate to="/login" />}
        />
        {/* Teacher courses route */}
        <Route path="/teachercourses" element={<TeacherCourses />} />
        {/* Mark attendance route */}
        <Route path="/markattendance" element={<MarkAttendance />} />
        {/* Filter students route */}
        <Route path="/filterstudents" element={<FilterStudents />} />
        {/* My students route */}
        <Route path="/mystudents" element={<MyStudents />} />
        {/* Attendance report route */}
        <Route path="/attendancereport" element={<AttendanceReport />} />
        {/* Manage users route */}
        <Route path="/manageusers" element={<Users />} />
        {/* Manage courses route */}
        <Route path="/managecourses" element={<ManageCourses />} />
        {/* Manage enrollments route */}
        <Route path="/manageenrollments" element={<ManageEnrollments />} />
        {/* Manage sessions route */}
        <Route path="/managesessions" element={<ManageSessions />} />
        {/* Main page route */}
        <Route path="/main" element={<Main />} />

        {/* Catch-all route: redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/main" />} />
      </Routes>
    </Router>
  );
}

export default App;
