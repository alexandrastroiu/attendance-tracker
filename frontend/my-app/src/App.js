/*import './App.css';
import Login from './components/Login/Login'

function App() {
  return (
    <div>
      <Login/>
    </div>
  );
}

export default App;
*/ 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Home from './components/HomePage/Home';

function App() {
  const userRole = localStorage.getItem('userRole'); // check if user is logged in

  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Home route, only accessible if logged in */}
        <Route 
          path="/home" 
          element={userRole ? <Home /> : <Navigate to="/login" />} 
        />

        {/* Catch-all route: redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

