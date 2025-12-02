import React, { useEffect, useState } from 'react';
import './Users.css';
import Navbar from "../NavigationBar/Navbar";

const BASE_URL = 'http://localhost:8888/management_attendance/attendance-tracker/backend/api/admin/sessions';
const BASE_URL_COURSES = 'http://localhost:8888/management_attendance/attendance-tracker/backend/api/admin/courses';

const ManageSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandAdd, setExpandAdd] = useState(false);
  const [expandDelete, setExpandDelete] = useState(false);
  const [expandView, setExpandView] = useState(false);

  const initialSessionState = {
    session_id: null,
    course_id: "",
    session_date: "",
    session_topic: "",
  };

  const [sessionForm, setSessionForm] = useState(initialSessionState);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [sessionRes, courseRes] = await Promise.all([
          fetch(`${BASE_URL}/getCourseSessions.php`, { credentials: 'include' }),
          fetch(`${BASE_URL_COURSES}/getCourses.php`, { credentials: 'include' }),
        ]);

        const sessionData = await sessionRes.json();
        const courseData = await courseRes.json();

        setSessions(sessionData.sessions || []);
        setCourses(courseData.courses || []);

      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const fetchSessions = async () => {
    const res = await fetch(`${BASE_URL}/getCourseSessions.php`, { credentials: 'include' });
    const data = await res.json();
    setSessions(data.sessions || []);
  };

  const handleChange = e => {
    setSessionForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // add session
  const handleAddSession = async () => {
    if (!sessionForm.session_date || !sessionForm.course_id) {
      alert("Session date and course are required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/addCourseSession.php`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(sessionForm)
      });
      const data = await res.json();

      if (data.success) {
        alert("Session added");
        fetchSessions();
        setSessionForm(initialSessionState);
        setExpandAdd(false);
      } else {
        alert(data.error);
      }
    } catch {
      alert("Error adding session");
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const res = await fetch(`${BASE_URL}/deleteCourseSession.php`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ session_id: id })
      });

      const data = await res.json();

      if (data.success) {
        alert("Session deleted");
        fetchSessions();
      } else {
        alert(data.error);
      }

    } catch {
      alert("Error deleting session");
    }
  };

  if (loading) return <p style={{ textAlign:'center' }}>Loading...</p>;
  if (error) return <p style={{ textAlign:'center', color:'red' }}>{error}</p>;

  return (
    <div className="users-page">
      <Navbar />
      <div className="users-card">
        <h1 className="users-header">Manage Course Sessions</h1>

        {/* ADD SESSION */}
        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandAdd(!expandAdd)}>
            Add Session
          </button>
          {expandAdd && (
            <div className="users-form">
              <select name="course_id" value={sessionForm.course_id} onChange={handleChange}>
                <option value="">Select Course</option>
                {courses.map(c =>
                  <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                )}
              </select>

              <input type="date" name="session_date" value={sessionForm.session_date} onChange={handleChange} />

              <input type="text" name="session_topic" placeholder="Topic (optional)" value={sessionForm.session_topic} onChange={handleChange} />

              <button className="users-submit" onClick={handleAddSession}>Submit</button>
            </div>
          )}
        </div>

        {/* DELETE SESSION */}
        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandDelete(!expandDelete)}>
            Delete Session
          </button>

          {expandDelete && (
            <ul className="users-delete-list">
              {sessions.map(s => (
                <li key={s.session_id}>
                  {s.course_name} — {s.session_date}
                  <button className="delete-btn" onClick={() => handleDeleteSession(s.session_id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* VIEW SESSIONS */}
        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandView(!expandView)}>
            View Sessions
          </button>
          {expandView && (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Topic</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.session_id}>
                      <td>{s.course_name}</td>
                      <td>{s.session_date}</td>
                      <td>{s.session_topic || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageSessions;
