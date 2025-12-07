import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { FaBook, FaCheckCircle, FaUserClock, FaUsers, FaUserPlus, FaClipboardList, FaUserCircle, FaGraduationCap } from 'react-icons/fa';
import Navbar from "../NavigationBar/Navbar";


const Home = () => {
  const navigate = useNavigate();
  // Example: user type saved in localStorage after login
  const userRole = localStorage.getItem('userRole')

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/main');
  };

  const renderStudentMenu = () => (
    <div className="menu-cards">
      <div className="card" onClick={() => navigate('/courses')}>
        <FaBook className="card-icon"/>
        My Courses
      </div>
      <div className="card" onClick={() => navigate('/attendance')}>
        <FaCheckCircle className="card-icon"/>
        Attendance & Absences
      </div>
        <div className="card" onClick={() => navigate("/profile")}>
        <FaUserCircle className="card-icon"/>
        My Profile
      </div>
    </div>
  );

  const renderProfessorMenu = () => (
    <div className="menu-cards">
      <div className="card" onClick={() => navigate("/teachercourses")}>
        <FaBook className="card-icon"/>
        My Courses
      </div>
      <div className="card" onClick={() => navigate("/markattendance")}>
        <FaCheckCircle className="card-icon"/>
        Mark Attendance
      </div>
      <div className="card" onClick={() => navigate("/filterstudents")}>
        <FaUsers className="card-icon"/>
        Filter Students
      </div>
      <div className="card" onClick={() => navigate("/mystudents")}>
        <FaGraduationCap className="card-icon"/>
        My Students
      </div>
      <div className="card" onClick={() => navigate("/attendancereport")}>
        <FaClipboardList className="card-icon"/>
        Attendance Rates
      </div>
      <div className="card" onClick={() => navigate("/profile")}>
        <FaUserCircle className="card-icon"/>
        My Profile
      </div>
    </div>
  );

  const renderAdminMenu = () => (
    <div className="menu-cards">
      <div className="card" onClick={() => navigate("/manageusers")}>
        <FaUsers className="card-icon"/>
        Manage Users
      </div>
      <div className="card" onClick={() => navigate("/managecourses")}>
        <FaBook className="card-icon"/>
        Manage Courses
      </div>
      <div className="card" onClick={() => navigate("/managesessions")}>
        <FaUserClock className="card-icon"/>
        Manage Course Sessions
      </div>
      <div className="card"  onClick={() => navigate("/manageenrollments")}>
        <FaUserPlus className="card-icon"/>
        Assign Courses to Students
      </div>
      <div className="card" onClick={() => navigate("/profile")}>
        <FaUserCircle className="card-icon"/>
        My Profile
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <Navbar />
      <header className="home-header">
        <h1>Faculty of Computer Science  & Engineering -  Attendance Management</h1>
        
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>


      <main className="home-main">
        {userRole === 'student' && renderStudentMenu()}
        {userRole === 'teacher' && renderProfessorMenu()}
        {userRole === 'admin' && renderAdminMenu()}
      </main>
    </div>
  );
};

export default Home;
