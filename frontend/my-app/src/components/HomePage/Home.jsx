import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { FaBook, FaCheckCircle, FaUsers, FaUserPlus, FaChalkboardTeacher, FaClipboardList } from 'react-icons/fa';

// Example: user type saved in localStorage after login
const userRole = localStorage.getItem('userRole')

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const renderStudentMenu = () => (
    <div className="menu-cards">
      <div className="card">
        <FaBook className="card-icon"/>
        My Courses
      </div>
      <div className="card">
        <FaCheckCircle className="card-icon"/>
        Attendance & Absences
      </div>
    </div>
  );

  const renderProfessorMenu = () => (
    <div className="menu-cards">
      <div className="card">
        <FaBook className="card-icon"/>
        My Courses
      </div>
      <div className="card">
        <FaCheckCircle className="card-icon"/>
        Mark Attendance
      </div>
      <div className="card">
        <FaUsers className="card-icon"/>
        Filter Students
      </div>
      <div className="card">
        <FaClipboardList className="card-icon"/>
        Attendance Rates
      </div>
    </div>
  );

  const renderAdminMenu = () => (
    <div className="menu-cards">
      <div className="card">
        <FaUsers className="card-icon"/>
        Manage Users
      </div>
      <div className="card">
        <FaBook className="card-icon"/>
        Manage Courses
      </div>
      <div className="card">
        <FaUserPlus className="card-icon"/>
        Assign Courses to Students
      </div>
      <div className="card">
        <FaChalkboardTeacher className="card-icon"/>
        Assign Courses to Professors
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Faculty Attendance Management</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="home-main">
        {userRole === 'student' && renderStudentMenu()}
        {userRole === 'professor' && renderProfessorMenu()}
        {userRole === 'admin' && renderAdminMenu()}
      </main>
    </div>
  );
};

export default Home;
