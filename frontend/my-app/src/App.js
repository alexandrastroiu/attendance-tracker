import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Home from './components/HomePage/Home';
import Courses from './components/StudentFeatures/Courses/Courses';
import Attendance from './components/StudentFeatures/Attendance/Attendance';
import Profile from './components/Profile/Profile';
import TeacherCourses from './components/TeacherFeatures/TeacherCourses';
import MarkAttendance from './components/TeacherFeatures/MarkAttendance';
import FilterStudents from './components/TeacherFeatures/FilterStudents'; 
import AttendanceReport from './components/TeacherFeatures/AttendanceReport';
import Users from './components/AdminFeatures/AddRemoveUsers';
import ManageCourses from './components/AdminFeatures/ManageCourses';
import ManageEnrollments from './components/AdminFeatures/ManageEnrollment';
import ManageSessions from './components/AdminFeatures/ManageSessions';

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

        <Route path="/courses" element={<Courses />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route
          path="/profile"
          element={userRole ? <Profile /> : <Navigate to="/login" />}
        />
         <Route path="/teachercourses" element={<TeacherCourses />} />

         <Route path="/markattendance" element={<MarkAttendance />} />

         <Route path="/filterstudents" element={<FilterStudents />} />

         <Route path="/attendancereport" element={<AttendanceReport />} />

          <Route path="/manageusers" element={<Users />} />

          <Route path="/managecourses" element={<ManageCourses/>} />

          <Route path="/manageenrollments" element={<ManageEnrollments/>} />

          <Route path="/managesessions" element={<ManageSessions/>} />

        {/* Catch-all route: redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

