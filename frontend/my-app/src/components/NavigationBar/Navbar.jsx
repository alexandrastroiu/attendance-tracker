import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { FaBars, FaHome, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      <div className="sidebar-header">
        <FaBars className="toggle-icon" onClick={toggleSidebar} />
        {!collapsed && <span className="logo-text">MENU</span>}
      </div>

      <div className="sidebar-content">
        <button onClick={() => navigate("/home")}>
          <FaHome />
          {!collapsed && <span>Home</span>}
        </button>

        {/* role-based */}
        {userRole === "admin" && (
          <>
            <button onClick={() => navigate("/manageusers")}> {!collapsed && <span>Manage Users</span>}</button>
            <button onClick={() => navigate("/managecourses")}> {!collapsed && <span>Manage Courses</span>}</button>
            <button onClick={() => navigate("/manageenrollments")}> {!collapsed && <span>Assign Courses to Students</span>}</button>
            <button onClick={() => navigate("/profile")}> {!collapsed && <span>My Profile</span>}</button>
          </>
        )}

        {userRole === "teacher" && (
          <>
            <button onClick={() => navigate("/teachercourses")}> {!collapsed && <span>My Courses</span>}</button>
            <button onClick={() => navigate("/markattendance")}> {!collapsed && <span>Mark Attendance</span>}</button>
            <button onClick={() => navigate("/filterstudents")}> {!collapsed && <span>Filter Students</span>}</button>
            <button onClick={() => navigate("/attendancereport")}> {!collapsed && <span>Attendance Rates</span>}</button>
            <button onClick={() => navigate("/profile")}> {!collapsed && <span>My Profile</span>}</button>
          </>
        )}

        {userRole === "student" && (
          <>
            <button onClick={() => navigate("/courses")}> {!collapsed && <span>My Courses</span>}</button>
            <button onClick={() => navigate("/attendance")}> {!collapsed && <span>Attendance & Absences</span>}</button>
            <button onClick={() => navigate("/profile")}> {!collapsed && <span>My Profile</span>}</button>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </div>
  );
};

export default Navbar;
