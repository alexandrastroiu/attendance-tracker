import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'

import user_icon from '../assets/person.png'
import password_icon from '../assets/password.png'
import logo from "../assets/collegeLogo.png";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async() => {
    try {
        const response = await fetch('http://localhost:8888/management_attendance/attendance-tracker/backend/auth/login.php', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include', // for PHP Sessions (tells the browser to send cookies back and forth)
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Logged in');
        localStorage.setItem('userRole', data.userRole);
        onLogin();
        console.log('Login response:', data);
        navigate('/home');
      }
      else {
        setMessage('Invalid username or password');
      }
    }
    catch (error){
      console.error('Error:', error);
      setMessage('Error connecting to server');
    }
  }

  return (
    <div className='container'>
        <div className='header'>
        <img src={logo} className="college-logo" alt="College Logo" />
         <div className="text">Login</div>
         <div className="underline"></div>
        </div>
        <div className="inputs">
            <div className="input">
                <img src={user_icon} alt="" />
                <input type="text" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>
            <div className="input">
                <img src={password_icon} alt="" />
                <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
        </div>
        <div className="submit-container">
            <div className="submit" onClick={handleLogin}>Login</div>
        </div>
        {message && <p class="message-box">{message}</p>}
    </div>
  )
}

export default Login

